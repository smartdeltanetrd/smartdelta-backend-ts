import mongoose from "mongoose";

import { EdgeSchema } from "../Schemas/Schemas.schema";

const EdgeModel = mongoose.model("Edge", EdgeSchema);

export default EdgeModel;
