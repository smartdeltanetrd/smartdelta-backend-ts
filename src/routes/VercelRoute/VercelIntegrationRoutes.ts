import { Request, Response, NextFunction, Router } from 'express';
import BaseRouterClass from '../../utils/classes/BaseRouterClass';
import VercelIntegrationController from '../../controllers/VercelIntegrationController';
import { body, validationResult } from 'express-validator';

class VercelIntegrationRouter extends BaseRouterClass {
	constructor() {
		super();
		this.initRoutes();
	}

	private validateIntegration = [
		body('username').isString().withMessage('Username must be a string'),
		body('email').isEmail().withMessage('Invalid email format'),
		body('token').isString().withMessage('Token must be a string'),
		(req: Request, res: Response, next: NextFunction) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			next();
		}
	];

	// it saves integration handler
	async saveIntegration(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.saveIntegration(req.body);
			res.status(201).json(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}

	// list integrations handler
	async listIntegrations(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await VercelIntegrationController.listIntegrations();
			res.status(200).json({ integrations: result });
		} catch (error) {
			this.handleError(error, next);
		}
	}

	// fetch vercel projects handler
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

	initRoutes(): void {
		this.router.post('/store', this.validateIntegration, this.saveIntegration.bind(this));
		this.router.get('/list', this.listIntegrations.bind(this));
		this.router.post('/projects', this.getVercelProjects.bind(this));
	}
}

export const VercelIntegrationRoutes = new VercelIntegrationRouter().router;
