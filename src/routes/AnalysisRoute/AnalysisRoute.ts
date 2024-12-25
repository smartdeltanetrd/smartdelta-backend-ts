import { NextFunction, Request, Response } from 'express';
import AnalysisController from '../../controllers/AnalysisController';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';

class AnalysisRouterClass extends BaseRouterClass {
	private AnalysisController: AnalysisController;
	constructor() {
		super();
		this.AnalysisController = new AnalysisController();
	}
	async getResourcePrediction(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await this.AnalysisController.predictResourceTrends();
			// Send the result here
			res.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}

	async submitToCompareFiles(req: Request, res: Response, next: NextFunction) {
		try {
			let result = await this.AnalysisController.compareLogFiles(req, res);
			console.log(result);
			res.status(200).send(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}
	initRoutes(): void {
		this.router.get('/predict-resource', this.getResourcePrediction.bind(this));
		this.router.post('/compare-logs', this.submitToCompareFiles.bind(this));
	}
}

export const AnalysisRoutes = new AnalysisRouterClass().router;
