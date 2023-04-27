import { Document } from "mongoose";
import MLModelInputsConts from "../../../../constants/MLModelInput.constants"


export interface IEdge extends Document {
    "messageParams.subscriber": string
}