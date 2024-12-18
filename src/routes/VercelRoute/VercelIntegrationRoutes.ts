import { Request, Response, NextFunction } from 'express';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';
import VercelIntegrationController from '../../controllers/VercelIntegrationController';
import { validateIntegration } from '../../middlewares/vercel/validateIntegrationMiddleware';

class VercelIntegrationRouter extends BaseRouterClass {
	constructor() {
		super();
		this.initRoutes();
	}

	async saveIntegration(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.saveIntegration(req.body);
			res.status(201).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	async listIntegrations(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.listIntegrations();
			res.status(200).json({ integrations: result });
		} catch (error) {
			this.handleError(error, next);
		}
	}

	async getEncryptedToken(req: Request, res: Response, next: NextFunction) {
		try {
			const { email } = req.body;
			if (!email) {
				return res.status(400).json({ message: 'Email is required to fetch the token' });
			}

			const result = await VercelIntegrationController.getEncryptedToken(email);
			res.status(200).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	async getVercelProjects(req: Request, res: Response, next: NextFunction) {
		try {
			const { encryptedToken } = req.body;
			const result = await VercelIntegrationController.getVercelProjects(encryptedToken);
			res.status(200).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	initRoutes(): void {
		this.router.post('/store', validateIntegration, this.saveIntegration.bind(this));
		this.router.get('/list', this.listIntegrations.bind(this));
		this.router.post('/token', this.getEncryptedToken.bind(this)); // Send encrypted token
		this.router.post('/projects', this.getVercelProjects.bind(this)); // Accept encrypted token
	}
}

export const VercelIntegrationRoutes = new VercelIntegrationRouter().router;
