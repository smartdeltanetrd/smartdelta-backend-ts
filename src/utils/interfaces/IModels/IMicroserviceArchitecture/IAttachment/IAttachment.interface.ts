import { Document } from "mongoose";

export interface IAttachment extends Document {
    //owner , size etc...
    owner?: string
    path: string
}

