import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Define the validation rules
export const validateIntegration = [
	body('username').isString().withMessage('Username must be a string'),
	body('email').isEmail().withMessage('Invalid email format'),
	body('token').isString().withMessage('Token must be a string'),

	// Middleware to handle validation errors
	(req: Request, res: Response, next: NextFunction) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	}
];
