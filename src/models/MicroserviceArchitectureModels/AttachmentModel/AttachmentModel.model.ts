import mongoose from "mongoose";

import { AttachmentSchema } from "../Schemas/Schemas.schema";

const AttachmentModel = mongoose.model("Attachment", AttachmentSchema);

export default AttachmentModel;
