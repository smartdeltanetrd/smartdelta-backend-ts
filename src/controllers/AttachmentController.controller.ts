import AttachmentModel from '../models/MicroserviceArchitectureModels/AttachmentModel/AttachmentModel.model';
import CommonClass from '../utils/classes/CommonClass';
import { getRawData, processData } from '../libs/csvParser/csvParser.function';
import { PathLike } from 'fs';
import { IAttachment } from '../utils/interfaces/ILogic/IAttachment.interface';
import MLModelInputsConts from '../utils/constants/MLModelInput.constants';
import { MLCSVRow } from '../utils/types/MLCSVRow.type';
import BaseError from '../utils/classes/BaseErrorClass';

import axios from 'axios';
import { format } from '@fast-csv/format';
import FormData from 'form-data';

export default class AttachmentController extends CommonClass {
	constructor() {
		super();
	}
	async listAllAttachments(): Promise<any> {
		try {
			let attachments = await AttachmentModel.find({}).select(['path', 'fileSize', 'createdAt', 'owner', 'fileName']);
			console.log(attachments);
			return attachments;
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
		try {
			// let attachment = await AttachmentModel.findOneAndDelete({ _id: attachmentId });
			let attachment = await AttachmentModel.findOneAndUpdate({ _id: attachmentId }, { isDeleted: true }, { new: true });
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
				direction.edges.forEach((edge) => {
					let CSVRow = <MLCSVRow>{};
					CSVRow.destination_id = direction._id?.toString();
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

			const csvStream = format({ headers: true });
			// Write the headers to the CSV file
			csvStream.write(csvHeaders);

			// Write the data to the CSV file
			CSVRowArray.forEach((row: any) => {
				csvStream.write(row);
			});

			// End the CSV stream and pipe it to the response
			csvStream.end();

			return csvStream;
		}  catch (error: any) {
			throw new BaseError(
				error.message || 'Error happened while formating attachment to CSV',
				'Model Could Not Be Formatted to CSV',
				500,
				'Training Error'
			);
		}
	}

	async trainModelWithAttachment(attachmentPath: string): Promise<any> {
		try {
			const csvStream = await this.formatAttachmentToCSV(attachmentPath);
			const formData = new FormData();
			formData.append('file', csvStream, 'data.csv');

			const { data } = await axios.post('http://127.0.0.1:5003/train', formData, {
				headers: formData.getHeaders(),
			});

			// Return the response from the ML Service
			return { trainingResponse: data };
		} catch (error: any) {
			throw new BaseError(
				error.message || 'Error happened while training model',
				'Model Could Not Be Trained with the Attachment',
				500,
				'Training Error'
			);
		}
	}
}