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
			// Check if file exist in request
			if (!req.file) {
				next(
					new BaseError(
						`"file" parameter does not provided in request object`,
						'Bad Request',
						400,
						'Bad Request Occured While Adding Attachment'
					)
				);
				return;
			}
			let csvPath = path.join(process.cwd(), this.config.MULTER_CSV_DIR || 'src/data/uploads/csvData', req.file?.filename);

			let attachment = await this.AttachmentController.analyzeAttachment(csvPath);

			attachment['path'] = req.file.filename;
			attachment['fileSize'] = (req.file.size / 1024).toFixed(2);
			attachment['fileName'] = req.file.originalname;
			console.log(req.file.originalname);
			const result = await this.AttachmentController.uploadAttachment(attachment);

			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
			res.status(201).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}
	async getAttachment(req: Request, res: Response, next: NextFunction) {
		try {
		  let csvName = req.params.name; // Retrieve the parameter from req.params
		  console.log(csvName)
		  let attachment = await this.AttachmentController.getAttachment(csvName);
		  res.status(200).send(attachment);
		} catch (error: any) {
		  this.handleError(error, next);
		}
	  }
	  
	async listAllAttachments(req: Request, res: Response, next: NextFunction) {
		try {
			let attachmentsList = await this.AttachmentController.listAllAttachments();
			res.status(200).json(attachmentsList);
		} catch (error) {
			this.handleError(error, next);
		}
	}
	async deleteAttachment(req: Request, res: Response, next: NextFunction) {
		try {
			const { id, ...rest } = req.query;
			if (!id) {
				throw new BaseError('ID should be provided', 'Bad Request', 400, 'Bad Request Performed');
			}
			await this.AttachmentController.deleteAttachment(id.toString());
			res.status(202).json({ status: true, message: 'Successfully Deleted' });
		} catch (error) {
			this.handleError(error, next);
		}
	}
	async getMLCSVData(req: Request, res: Response, next: NextFunction) {
		try {
			const csvResult = await this.AttachmentController.formatAttachmentToCSV(req.body.name);
			const csvStream = format({ headers: true });

			res.setHeader('Content-disposition', `attachment; filename=${req.body.name}.csv`);
			res.set('Content-Type', 'text/csv');

			if (!csvResult) {
				throw new BaseError(
					this.catchError(
						'error',
						`Given Attachment Does Not Specify Requirements (Leak of Data). Attachment Name : ${req.body.name}`
					),
					'Not Found',
					404,
					'Not Found Error'
				);
			}
			// Write the headers to the CSV file
			csvStream.write(csvResult.headers);

			// Write the data to the CSV file
			csvResult.data.forEach((row: any) => {
				csvStream.write(row);
			});

			// End the CSV stream and pipe it to the response
			csvStream.end();
			res.attachment(`${req.body.name}`);
			res.set('Content-Type', 'text/csv');
			csvStream.pipe(res);
		} catch (error) {
			this.handleError(error, next);
		}
	}
	initRoutes(): void {
		this.router.post('/upload', uploadCsv.single('file'), this.addNewAttachment.bind(this));
		this.router.get('/read/:name', this.getAttachment.bind(this));
		this.router.get('/generate-csv', this.getMLCSVData.bind(this));
		this.router.get('/list', this.listAllAttachments.bind(this));
		this.router.delete('/delete', this.deleteAttachment.bind(this));
	}
}

export const AttachmentRoutes = new AttachmentRouterClass().router;
