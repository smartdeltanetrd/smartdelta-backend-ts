import mongoose from "mongoose";
import * as config from "../config"
const mongoString = config.default.MONGODB_CONNECTION_STRING || "mongodb://127.0.0.1:27017/SmartDeltaApi";

const mongoSetup = async () => {
    mongoose.Promise = global.Promise
    await mongoose.connect(mongoString)
    console.log("MongoDB Connected // Change Here With Log")
}

export default mongoSetup;