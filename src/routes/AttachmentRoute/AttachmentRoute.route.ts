import { Response, Request, NextFunction } from "express";
import AttachmentController from "../../controllers/AttachmentController.controller";
import { INewAttachment } from "../../utils/interfaces/ILogic/INewAttachment";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";
import upload from "../../libs/fileUpload/multer.function";
import path from "path";
import { MulterError } from "multer";
import BaseError from "../../utils/classes/BaseErrorClass";

class AttachmentRouterClass extends BaseRouterClass {

    private AttachmentController: AttachmentController;
    constructor() {
        super();
        this.AttachmentController = new AttachmentController();

    }

    async addNewAttachment(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                next(new BaseError("No file provided", "Undefined file", 422, "No File Provided"))
                return
            }
            const attach: INewAttachment = {
                path: req.file?.filename || ""
            }
            const attachment = await this.AttachmentController.uploadAttachment(attach);
            res.status(201).json(attachment)

        } catch (error) {
            next(new BaseError(this.catchError(error, "Internal Server Error"), "AttachmentUpload", 500, "Internal Server Error"))
        }
    }

    async analyzeAttachment(req: Request, res: Response, next: NextFunction) {
        try {
            let csvName = req.body.name
            let csvPath = path.join(process.cwd(), this.config.MULTER_CSV_DIR || 'src/data/uploads/csvData', csvName)
            let analyzedData = await this.AttachmentController.analyzeAttachment(csvPath)
            res.status(200).send(analyzedData);

        } catch (error: any) {
            this.logger.error(error.message)
            next(new BaseError(this.catchError(error, "Internal Server Error"), "Analyzing Attachment Failed", 500, "Internal Server Error"))
        }
    }


    initRoutes(): void {
        this.router.post('/upload', upload.single("file"), this.addNewAttachment.bind(this));
        this.router.get('/analyze', this.analyzeAttachment.bind(this))
    }
}

export const AttachmentRoutes = new AttachmentRouterClass().router