import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import config from "../../config/config";

const storageConfig = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, storageCallback) => {
        storageCallback(null, config.MULTER_CSV_DIR)
    },
    filename: (req: Request, file: Express.Multer.File, callback) => {
        const filename = Date.now().toString().concat(".").concat(file.originalname.toLowerCase().split(".").pop() || "csv")
        callback(null, filename)
    },
})

const upload = multer({
    storage: storageConfig,

    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (file.mimetype === "text/csv") {
            callback(null, true)
        }
        else {
            callback(null, false)
            return callback(new Error("Only .csv format allowed !"))
        }
    }
})

export default upload;