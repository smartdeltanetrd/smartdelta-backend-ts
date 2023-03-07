import mongoose, { Schema } from "mongoose";
import { IAttachment } from "../../utils/interfaces/IModels/IAttachment";


const AttachmentSchema = new mongoose.Schema({
    owner: {
        type: String,
        default: "admin"
    },
    path: {
        type: String,
        required: true
    }
})


const AttachmentModel = mongoose.model("AttachmentModel", AttachmentSchema)

export default AttachmentModel;