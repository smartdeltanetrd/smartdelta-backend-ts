import { Request, Response, NextFunction, Router } from 'express';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';
import VercelIntegrationController from '../../controllers/VercelIntegrationController';
import { validateIntegration } from '../../middlewares/vercel/validateIntegrationMiddleware';

class VercelIntegrationRouter extends BaseRouterClass {
	constructor() {
		super();
		this.initRoutes();
	}

	// Save integration handler
	async saveIntegration(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.saveIntegration(req.body);
			res.status(201).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	// List integrations handler
	async listIntegrations(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.listIntegrations();
			res.status(200).json({ integrations: result });
		} catch (error) {
			this.handleError(error, next);
		}
	}

	// Fetch Vercel projects handler
	async getVercelProjects(req: Request, res: Response, next: NextFunction) {
		try {
			const { email } = req.body;
			if (!email) {
				return res.status(400).json({ message: 'Email is required to fetch projects' });
			}

			const result = await VercelIntegrationController.getVercelProjects(email);
			res.status(200).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	// Initialize routes
	initRoutes(): void {
		this.router.post('/store', validateIntegration, this.saveIntegration.bind(this));
		this.router.get('/list', this.listIntegrations.bind(this));
		this.router.post('/projects', validateIntegration, this.getVercelProjects.bind(this));
	}
}

export const VercelIntegrationRoutes = new VercelIntegrationRouter().router;
