
import * as dotenv from "dotenv"
dotenv.config()
dotenv.config({ path: "../../.env" })

const config = {
    PORT: process.env.PORT,
    MULTER_CSV_DIR: process.env.MULTER_CSV_DIR || "src/data/uploads/csvData",
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_CONNECTION_STRING: (process.env.MONGO_DB_CONNECTION_STRING || process.env.MONGO_DB_DATABASE_NAME)
        ? process.env.MONGO_DB_CONNECTION_STRING?.concat(process.env.MONGO_DB_DATABASE_NAME || "SmartDeltaApi") : "mongodb://127.0.0.1:27017/SmartDeltaApi"
}

export default config