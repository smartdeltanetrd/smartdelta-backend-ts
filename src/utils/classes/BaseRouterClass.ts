
import { Router, NextFunction } from "express";
import CommonClass from "./CommonClass";

export default class BaseRouterClass extends CommonClass {

    router: Router;

    constructor() {
        super();
        this.router = Router();
        this.initRoutes();
    }

    protected catchError(error: any, staticMessage: string) {
        return (error instanceof Error) ? error.message : staticMessage
    }

    protected handleError(error: any, next: NextFunction) {
        this.errorLogger(error)

        if (next) {
            next(error)
        } else {
            throw error
        }
    }

    initRoutes() {

    }
}