import mongoose from "mongoose";

const mongoString = process.env.MONGO_DB_CONNECTION_STRING || "mongodb://127.0.0.1:27017/SmartDeltaApi";

const mongoSetup = () => {
    mongoose.Promise = global.Promise
    mongoose.connect(mongoString)
    console.log("MongoDB Connected // Change Here With Log")
}

export default mongoSetup;