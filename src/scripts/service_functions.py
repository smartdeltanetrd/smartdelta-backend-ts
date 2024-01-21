FieldBaseType = enum.Enum('FieldBaseType', 'float integer categorical date string')

class FieldType_General:

    def __init__(self, data):
        if not isinstance(data, np.ndarray) or len(data.shape) != 1:
            raise ValueError(f"Expected 1-d numpy array, got: {type(data)}")
        self.data = data


class IntOrFloatMixin:

    def find_big_differences(self, other_field):
        BIG_DIFF_THR = 2  # We suppose that big diffs shold be greater than BIG_DIFF_THR*diff.mean()
        RARE_DIFF_THR = 0.1  # We suppose that rare diffs should occur less than RARE_DIFF_THR*len(data)
        MAX_THR_CHANGE_ITERS = 10  # No more than 10 iterations to find optimal threshold

        other_data = other_field.data
        if len(self.data) != len(other_data):
            raise ValueError(f"Lengths are not equal: {len(self.data)} and {len(other_data)}")
        diff = np.abs(self.data - other_data)
        if np.isclose(diff.mean(), 0) or diff.max() <= BIG_DIFF_THR*diff.mean():
            return np.array([], dtype=int)
        diff_vals = np.unique(diff)
        if len(diff_vals) < 2:
            return np.array([], dtype=int)
        biggest_thr = diff_vals[-2]  # one value before the maximum

        big_thr = BIG_DIFF_THR*diff.mean()
        if big_thr >= biggest_thr:
            return np.array([], dtype=int)
        found = False
        for thr in np.linspace(big_thr, biggest_thr, num=MAX_THR_CHANGE_ITERS):
            if len(np.where(diff > thr)) < RARE_DIFF_THR*len(diff):
                found = True
                break
        if found:
            times = np.argwhere(diff > thr)  # thr is still defined after loop
        else:
            times = np.array([], dtype=int)
        return times


class FieldType_Float(FieldType_General, IntOrFloatMixin):
    BASE_TYPE = FieldBaseType.float


class FieldType_Int(FieldType_General, IntOrFloatMixin):
    BASE_TYPE = FieldBaseType.integer


class FieldType_Cat(FieldType_General):
    BASE_TYPE = FieldBaseType.categorical

    def compare_categories(self, other_field):
        other_data = other_field.data
        if len(self.data) != len(other_data):
            raise ValueError(f"Lengths are not equal: {len(self.data)} and {len(other_data)}")
        
        diff = np.where(self.data == other_data, 0, 1)
        match_rel = np.count_nonzero(diff == 0)/len(diff)
        matched_vals = set(self.data[np.argwhere(diff == 0)].flatten())
        nonmatched_vals = set(self.data[np.argwhere(diff != 0)].flatten()) | set(other_data[np.argwhere(diff != 0)].flatten())
        strict_matched_vals = matched_vals - nonmatched_vals
        strict_nonmatched_vals = nonmatched_vals - matched_vals
        return match_rel, matched_vals, nonmatched_vals, strict_matched_vals, strict_nonmatched_vals

    def count_values(self):
        vals, counts = np.unique(self.data, return_counts=True)
        cnt_idxs = counts.argsort()
        return vals[cnt_idxs[::-1]], counts[cnt_idxs[::-1]]


class FieldType_Date(FieldType_General):
    BASE_TYPE = FieldBaseType.date

    def __init__(self, data):
        time_data = np.vectorize(lambda t: t.timestamp())(data)
        super().__init__(time_data)


class FieldType_Str(FieldType_General):
    BASE_TYPE = FieldBaseType.string


class FieldType_Resource(FieldType_Float):

    def __init__(self, data, low_val, high_val, low_warn_level, high_warn_level):
        super().__init__(data)
        self.low_val = low_val
        self.high_val = high_val
        self.low_warn_level = low_warn_level
        self.high_warn_level = high_warn_level


class FieldType_CPUUtilization(FieldType_Resource):

    def __init__(self, data, high_warn_level):
        super().__init__(data, 0, 100, None, high_warn_level)


class FieldType_RAMUtilization(FieldType_Resource):

    def __init__(self, data, low_warn_level, high_warn_level):
        super().__init__(data, 0, 100, low_warn_level, high_warn_level)


def create_field_object(field_s, name, verbose=True):
    obj = None
    if obj is None:
        if np.issubdtype(field_s.dtype, np.floating):
            obj = FieldType_Float(field_s.values)
        elif np.issubdtype(field_s.dtype, np.integer):
            # TODO: may be categorical?
            obj = FieldType_Int(field_s.values)
    if obj is None:
        # here we assume, that it is string, but it also can be categorical
        try:
            date_s = field_s.apply(dateutil.parser.parse)
            obj = FieldType_Date(date_s.values)
        except:
            pass
    if obj is None:
        try:
            float_s = field_s.apply(float)
            try:
                int_s = float_s.apply(int)
                obj = FieldType_Int(int_s.values)
            except:
                obj = FieldType_Float(float_s.values)
        except:
            pass
    if obj is None:
        if field_s.nunique() < 0.9*len(field_s):
            obj = FieldType_Cat(field_s.values)
        else:
            obj = FieldType_Str(field_s.values)
    if verbose:
        print(f"{name}: autodetected type is {obj.BASE_TYPE}")
    return obj


def comparable_types(field1, field2):
    # TODO: implementation is missing
    return True

def align_base_field_types(field1, field2):
    # TODO: implementation is missing
    return field1, field2


def compare_fields(field1: FieldType_General, field2: FieldType_General):
    field1, field2 = align_base_field_types(field1, field2)
    comparison_res = {}
    if issubclass(type(field1), IntOrFloatMixin):
        comparison_res['big_difference_idxs'] = field1.find_big_differences(field2)
    if issubclass(type(field1), FieldType_Cat):
        match_rel, matched_vals, nonmatched_vals, strict_matched_vals, strict_nonmatched_vals = field1.compare_categories(field2)
        comparison_res['matched_relation'] = match_rel
        comparison_res['matched_vals'] = matched_vals
        comparison_res['nonmatched_vals'] = nonmatched_vals
        comparison_res['strict_matched_vals'] = strict_matched_vals
        comparison_res['strict_nonmatched_vals'] = strict_nonmatched_vals
    return comparison_res