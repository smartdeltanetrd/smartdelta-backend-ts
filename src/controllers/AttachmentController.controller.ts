import AttachmentModel from '../models/MicroserviceArchitectureModels/AttachmentModel/AttachmentModel.model';
import CommonClass from '../utils/classes/CommonClass';
import { getRawData, processData } from '../libs/csvParser/csvParser.function';
import { PathLike } from 'fs';
import { IAttachment } from '../utils/interfaces/ILogic/IAttachment.interface';

export default class AttachmentController extends CommonClass {
	constructor() {
		super();
	}

	async uploadAttachment(newAttachment: IAttachment): Promise<IAttachment> {
		try {
			let attachment = new AttachmentModel(newAttachment);
			await attachment.save();
			this.logger.info('New Attachment Created');
			return attachment;
		} catch (error) {
			this.logger.info('%s happened with %s', 'error', new Error(this.catchError(error, 'Cannot Added new Attachment')));
			throw new Error(this.catchError(error, 'Cannot Added new Attachment'));
		}
	}

	async getAttachment(attachmentName: string): Promise<IAttachment | null> {
		try {
			let attachment = await AttachmentModel.findOne({ path: attachmentName });
			if (!attachment) {
				return null;
			} else {
				return attachment;
			}
		} catch (error) {
			this.logger.info('%s happened with %s', 'error', new Error(this.catchError(error, 'Cannot read Attachment')));
			throw new Error(this.catchError(error, 'Cannot read Attachment'));
		}
	}
	async analyzeAttachment(attachmentPath: PathLike): Promise<any> {
		try {
			let rawData = await getRawData(attachmentPath);

			let analyzedData = await processData(rawData);

			return analyzedData;
		} catch (error) {
			throw new Error(this.catchError(error, 'Cannot Read Given Attachment'));
		}
	}
}
