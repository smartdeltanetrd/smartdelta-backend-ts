import { Response, Request, NextFunction } from "express";
import BaseError from "../../utils/classes/BaseErrorClass";


export const errorMiddleware = async (err: BaseError, req: Request, res: Response, next: NextFunction) => {

    const errObj = {
        message: err.message,
        statusCode: err.statusCode || 400,
        type: err.type,
        info: err.info
    }
    res.status(errObj.statusCode).send(errObj);
}