import { format } from '@fast-csv/format';
import MLModelInputsConts from '../../utils/constants/MLModelInput.constants';
import { Document } from 'mongoose';

export function createCSVObject(attachment: Document) {
	try {
		const csvHeaders = ['destination_id', 'edge_id'];
		Object.values(MLModelInputsConts).forEach((MLCONST) => {
			csvHeaders.push(MLCONST);
		});
	} catch (error) {}
}
