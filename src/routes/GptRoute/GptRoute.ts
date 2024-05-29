import { NextFunction, Request, Response } from "express";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";
import GptController from "../../controllers/GptController";

class GptRouterClass extends BaseRouterClass {
	private GptController: GptController;
	constructor() {
		super();
		this.GptController = new GptController();
	}

	async inputErrorData(req: Request, res: Response, next: NextFunction) {
		try {
		  const { errorData } = req.body;
		  const prompt = this.GptController.generatePrompt(errorData);
		  const result = await this.GptController.getErrorInsight(prompt);
		  res.status(200).send(result);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	
	initRoutes(): void {
		this.router.post('/input-error-data', this.inputErrorData.bind(this));

	}
}

export const GptRoutes = new GptRouterClass().router;
