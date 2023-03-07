
import { Document } from "mongoose";
import AttachmentModel from "../models/AttachmentModel/AttachmentModel.model";
import CommonClass from "../utils/classes/CommonClass";
import { INewAttachment } from "../utils/interfaces/ILogic/INewAttachment";
import { getRawData, processData } from "../libs/csvParser/csvParser.function";
import { PathLike } from "fs";


export default class AttachmentController extends CommonClass {


    constructor() {
        super();
    }

    async uploadAttachment(newAttachment: INewAttachment): Promise<Document | Error | undefined> {
        try {
            let attachment = new AttachmentModel(newAttachment)
            await attachment.save();
            this.logger.info("New Attachment Created")
            return attachment;

        } catch (error) {
            this.logger.info("%s happened with %s", 'error', new Error(this.catchError(error, "Cannot Added new Attachment")))
            throw new Error(this.catchError(error, "Cannot Added new Attachment"));
        }

    }

    async analyzeAttachment(attachmentPath: PathLike): Promise<any> {

        try {
            let rawData = await getRawData(attachmentPath);

            let analyzedData = await processData(rawData);

            return analyzedData

        } catch (error) {
            throw new Error(this.catchError(error, "Cannot Read Given Attachment"));
        }

    }
}
