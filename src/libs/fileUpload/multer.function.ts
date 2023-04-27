import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import config from "../../config/config";
import BaseError from "../../utils/classes/BaseErrorClass";
import logger from "../logger/logger.function";
import fs from "fs";

const storageConfig = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, storageCallback) => {
        if (!fs.existsSync(config.MULTER_CSV_DIR)) {
            fs.mkdirSync(config.MULTER_CSV_DIR, { recursive: true })
        }
        storageCallback(null, config.MULTER_CSV_DIR)
    },
    filename: (req: Request, file: Express.Multer.File, callback) => {
        const filename = Date.now().toString().concat(".").concat(file.originalname.toLowerCase().split(".").pop() || "csv")
        callback(null, filename)
    },
})

const uploadCsv = multer({
    storage: storageConfig,

    fileFilter: (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (file.mimetype === "text/csv") {
            callback(null, true)
        }
        else {
            callback(null, false)
            logger.error("Only CSV format Allowed")
            return callback(new BaseError("Only CSV format Allowed", "Wrong File Type Upload", 422, "Only CSV format allowed"))
        }
    }
})

export default uploadCsv;