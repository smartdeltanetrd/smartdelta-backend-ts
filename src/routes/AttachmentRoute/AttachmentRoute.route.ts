import { Response, Request, NextFunction } from "express";
import AttachmentController from "../../controllers/AttachmentController.controller";
import { INewAttachment } from "../../utils/interfaces/ILogic/INewAttachment";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";
import upload from "../../libs/fileUpload/multer.function";
import path from "path";

class AttachmentRouterClass extends BaseRouterClass {

    private AttachmentController: AttachmentController;
    constructor() {
        super();
        this.AttachmentController = new AttachmentController();

    }

    async addNewAttachment(req: Request, res: Response) {
        try {
            if (!req.file) {
                res.status(422).json({
                    message: "No file provided"
                })
            }
            const attach: INewAttachment = {
                path: req.file?.filename || ""
            }

            console.log("buffer :" ,req.file?.buffer)
            console.log("destination :" ,req.file?.destination)
            console.log("fieldname :" ,req.file?.fieldname)
            console.log("filename :" ,req.file?.filename)
            console.log("mimetype :" ,req.file?.mimetype)
            console.log("originalname :" ,req.file?.originalname)
            console.log("path :" ,req.file?.path)
            console.log("size :" ,req.file?.size)
            console.log("stream :" ,req.file?.stream)


            const attachment = await this.AttachmentController.uploadAttachment(attach);

            res.status(201).json(attachment)

        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error: this.catchError(error, "Error Happened Attachment Upload Route")
            })
        }
    }

    async analyzeAttachment(req: Request, res: Response) {
        try {

            let csvName = req.body.name
            let csvPath = path.join(process.cwd(), 'src/data/uploads/csvData', csvName)

            let analyzedData = await this.AttachmentController.analyzeAttachment(csvPath)

            res.status(200).send(analyzedData);

        } catch (error) {
            this.logger.error("")
            res.status(500).json({
                message: "Internal Server Error",
                error: this.catchError(error, "Error Happened Attachment Route")
            })
        }
    }



    initRoutes(): void {
        this.router.post('/upload', upload.single("file"), this.addNewAttachment.bind(this));
        // this.router.post('/attachment/upload', upload.single("file"), this.addNewAttachment.bind(this))
        this.router.get('/analyze', this.analyzeAttachment.bind(this))
    }
}

export const AttachmentRoutes = new AttachmentRouterClass().router