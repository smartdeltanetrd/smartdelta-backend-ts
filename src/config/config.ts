
import * as dotenv from "dotenv"
dotenv.config()
dotenv.config({ path: "../../.env" })

const config = {
    PORT: process.env.PORT,
    MULTER_CSV_DIR: process.env.MULTER_CSV_DIR || "data/uploads",
    NODE_ENV: process.env.NODE_ENV
}

export default config