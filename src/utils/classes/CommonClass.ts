
import logger from "../../libs/logger/logger.function";
import { Logger } from "winston";
import * as cfg from "../../config/config";

export default class CommonClass {

    protected logger: Logger
    protected config: any

    constructor() {
        this.logger = logger;
        this.config = cfg;
    }

    protected catchError(error: any, staticMessage: string) {
        return (error instanceof Error) ? error.message : staticMessage
    }

}