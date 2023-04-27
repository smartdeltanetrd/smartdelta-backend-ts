import AttachmentModel from '../models/MicroserviceArchitectureModels/AttachmentModel/AttachmentModel.model';
import CommonClass from '../utils/classes/CommonClass';
import { getRawData, processData } from '../libs/csvParser/csvParser.function';
import { PathLike } from 'fs';
import { IAttachment } from '../utils/interfaces/ILogic/IAttachment.interface';
import MLModelInputsConts from '../utils/constants/MLModelInput.constants';
import { MLCSVRow } from '../utils/types/MLCSVRow.type';
import { write } from '@fast-csv/format';

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

	async formatAttachmentToCSV(attachmentName: string): Promise<any> {
		try {
			const CSVRowArray: Array<MLCSVRow> = [];
			const CSVRow = <MLCSVRow>{};

			const attachment = await AttachmentModel.findOne({ path: attachmentName }).lean();
			const directions = attachment.directions;

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
		} catch (error) {}
	}
}
