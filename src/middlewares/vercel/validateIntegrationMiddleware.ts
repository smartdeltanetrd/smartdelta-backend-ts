import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateIntegration = [
	body('username').optional().isString().withMessage('Username must be a string'),
	body('email').isEmail().withMessage('Invalid email format'),
	body('token').optional().isString().withMessage('Token must be a string'),

	(req: Request, res: Response, next: NextFunction) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
