import AttachmentModel from '../models/MicroserviceArchitectureModels/AttachmentModel/AttachmentModel.model';
import CommonClass from '../utils/classes/CommonClass';
import { getRawData, processData } from '../libs/csvParser/csvParser.function';
import { PathLike } from 'fs';
import { IAttachment } from '../utils/interfaces/ILogic/IAttachment.interface';
import MLModelInputsConts from '../utils/constants/MLModelInput.constants';
import { MLCSVRow } from '../utils/types/MLCSVRow.type';
import BaseError from '../utils/classes/BaseErrorClass';


export default class AttachmentController extends CommonClass {
	constructor() {
		super();
	}
	async listAllAttachments(): Promise<any> {
		try {
			let attachments = await AttachmentModel.find({}).select(['path', 'fileSize', 'createdAt', 'owner', 'fileName']);
			console.log(attachments)
			return attachments
		} catch (error) {
			throw error;
		}
	}

	async uploadAttachment(newAttachment: IAttachment): Promise<IAttachment> {
		try {
			let attachment = new AttachmentModel(newAttachment);
			await attachment.save();
			this.infoLogger('New Attachment Created');
			//Change to AttachmentMeta ! -----> YAY !
			return attachment;
		} catch (error: any) {
			throw new BaseError(
				error.message || 'Error happened while Adding Attachment',
				'Attachment Could Not Added',
				500,
				'Uploading Error'
			);
		}
	}

	async getAttachment(attachmentName: string): Promise<IAttachment> {
		try {
			let attachment = await AttachmentModel.findOne({ path: attachmentName });
			if (!attachment) {
				throw new BaseError('Attachment Not Found', 'Not Found', 404, 'Attachment Not Found');
			} else {
				return attachment;
			}
		} catch (error) {
			throw error;
		}
	}

	async deleteAttachment(attachmentId: string) {
		//add prescript for delete to convert string to objectId
		try {
			
			let attachment = await AttachmentModel.findOneAndDelete({ _id: attachmentId });
			if (!attachment) {
				throw new BaseError('Attachment Not Found', 'Not Found', 404, 'Attachment Not Found');
			} else {
				return true;
			}
		} catch (error) {
			throw error;
		}
	}
	async analyzeAttachment(attachmentPath: PathLike): Promise<any> {
		try {
			let rawData = await getRawData(attachmentPath);
			if (rawData.length < 2) {
				throw new BaseError('Given attachment is empty', 'Bad File', 422, 'Bad Attachment Given');
			}
			let analyzedData = await processData(rawData);
			return analyzedData;
		} catch (error) {
			throw error;
		}
	}

	async formatAttachmentToCSV(attachmentName: string): Promise<any> {
		try {
			const CSVRowArray: Array<MLCSVRow> = [];
			const CSVRow = <MLCSVRow>{};

			const attachment = await AttachmentModel.findOne({ path: attachmentName }).lean();
			if (!attachment) {
				throw new BaseError('Attachment Not Found', 'Not Found', 404, 'Attachment Not Found');
			}
			const directions = attachment!.directions;

			const csvHeaders = ['destination_id', 'edge_id'];
			Object.values(MLModelInputsConts).forEach((MLCONST) => {
				csvHeaders.push(MLCONST);
			});

			directions.forEach((direction) => {
				CSVRow.destination_id = direction._id?.toString();

				direction.edges.forEach((edge) => {
					CSVRow.edge_id = edge._id?.toString();
					CSVRow.messageRealm = edge.messageRealm;
					CSVRow.serviceAction = edge.serviceAction;
					CSVRow['messageParams.subscriber'] = edge.subscriber;
					CSVRow['messageParams.calledMessageQueue'] = edge.calledMessageQueue;
					CSVRow['messageParams.type'] = edge.type;
					CSVRow['messageParams.messageID'] = edge.messageID;
					CSVRow['messageParams.correlationID'] = edge.correlationID;
					CSVRow['messageParams.transactionID'] = edge.transactionID;
					CSVRow['messageParams.originatingMS'] = edge.originatingMS;
					CSVRow['messageParams.terminatingMS'] = edge.terminatingMS;
					CSVRow['serviceData.httpParams.statusCode'] = edge.statusCode;
					CSVRow.message_id_length = edge.messageIDLen;
					CSVRow.correlation_id_length = edge.correlationID?.length;
					CSVRow.transaction_id_length = edge.transactionID?.length;
					CSVRowArray.push(CSVRow);
				});
			});

			return { headers: csvHeaders, data: CSVRowArray };
		} catch (error) {
			throw error;
		}
	}

}
