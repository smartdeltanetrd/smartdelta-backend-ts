import mongoose, { Schema } from "mongoose";
import { DirectionSchema } from "../Schemas/Schemas.schema";

const DirectionModel = mongoose.model("Direction", DirectionSchema);

export default DirectionModel;
