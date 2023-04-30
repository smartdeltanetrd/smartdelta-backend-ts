import { Response, Request, NextFunction } from 'express';
import AttachmentController from '../../controllers/AttachmentController.controller';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';
import uploadCsv from '../../libs/fileUpload/multer.function';
import path from 'path';
import BaseError from '../../utils/classes/BaseErrorClass';
import { format } from '@fast-csv/format';

class AttachmentRouterClass extends BaseRouterClass {
	private AttachmentController: AttachmentController;
	constructor() {
		super();
		this.AttachmentController = new AttachmentController();
	}

	async addNewAttachment(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.file) {
				next(new BaseError('No file provided', 'Undefined file', 422, 'No File Provided'));
				return;
			}
			let csvPath = path.join(process.cwd(), this.config.MULTER_CSV_DIR || 'src/data/uploads/csvData', req.file?.filename);
			let attachment = await this.AttachmentController.analyzeAttachment(csvPath);
			attachment['path'] = req.file.filename;
			const result = await this.AttachmentController.uploadAttachment(attachment);
			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
			res.status(201).json(result);
		} catch (error) {
			next(new BaseError(this.catchError(error, 'Internal Server Error'), 'AttachmentUpload', 500, 'Internal Server Error'));
		}
	}

	async getAttachment(req: Request, res: Response, next: NextFunction) {
		try {
			let csvName = req.body.name;
			let attachment = await this.AttachmentController.getAttachment(csvName);
			if (!attachment) {
				res.status(404).send('Not Found');
				return;
			}
			res.status(200).send(attachment);
		} catch (error: any) {
			this.logger.error(error.message);
			next(
				new BaseError(this.catchError(error, 'Internal Server Error'), 'Reading Attachment Failed', 500, 'Internal Server Error')
			);
		}
	}

	async getMLCSVData(req: Request, res: Response, next: NextFunction) {
		try {
			const { headers, data } = await this.AttachmentController.formatAttachmentToCSV(req.body.name);

			const csvStream = format({ headers: true });

			res.setHeader('Content-disposition', `attachment; filename=${req.body.name}.csv`);
			res.set('Content-Type', 'text/csv');

			// Write the headers to the CSV file
			csvStream.write(headers);

			// Write the data to the CSV file
			data.forEach((row: any) => {
				csvStream.write(row);
			});

			// End the CSV stream and pipe it to the response
			csvStream.end();
			res.attachment(`${req.body.name}.csv`);
			res.set('Content-Type', 'text/csv');
			csvStream.pipe(res);
		} catch (error: any) {
			this.logger.error(error.message);
			next(
				new BaseError(
					this.catchError(error, 'Internal Server Error'),
					'Cannot Generate Parameters from Given Attachment',
					500,
					'Internal Server Error'
				)
			);
		}
	}
	initRoutes(): void {
		this.router.post('/upload', uploadCsv.single('file'), this.addNewAttachment.bind(this));
		this.router.get('/read', this.getAttachment.bind(this));
		this.router.get('/generate-csv', this.getMLCSVData.bind(this));
	}
}

export const AttachmentRoutes = new AttachmentRouterClass().router;
