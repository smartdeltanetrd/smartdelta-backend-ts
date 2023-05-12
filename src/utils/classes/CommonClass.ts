import logger from '../../libs/logger/logger.function';
import { Logger } from 'winston';
import * as cfg from '../../config/config';
import { NextFunction } from 'express';

export default class CommonClass {
	private logger: Logger;
	protected config: any;

	constructor() {
		this.logger = logger;
		this.config = cfg;
	}

	protected catchError(error: any, staticMessage: string) {
		return error instanceof Error ? error.message : staticMessage;
	}

	protected errorLogger(error: any): void {
		this.logger.error('Found %s at %s :	', 'error', error);
	}

	protected infoLogger(message: String): void {
		this.logger.info(message);
	}
}
