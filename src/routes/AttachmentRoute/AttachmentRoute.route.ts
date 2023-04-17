import { Response, Request, NextFunction } from 'express';
import AttachmentController from '../../controllers/AttachmentController.controller';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';
import uploadCsv from '../../libs/fileUpload/multer.function';
import path from 'path';
import BaseError from '../../utils/classes/BaseErrorClass';

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
			res.status(201).json(result);
		} catch (error) {
			next(new BaseError(this.catchError(error, 'Internal Server Error'), 'AttachmentUpload', 500, 'Internal Server Error'));
		}
	}

	//Add new controller called ("GET-ANALYZED-ATTACHMENT")

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

	initRoutes(): void {
		this.router.post('/upload', uploadCsv.single('file'), this.addNewAttachment.bind(this));
		this.router.get('/read', this.getAttachment.bind(this));
	}
}

export const AttachmentRoutes = new AttachmentRouterClass().router;
