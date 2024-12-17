import VercelIntegrationModel from '../models/MicroserviceArchitectureModels/VercelModel/VercelIntegrationModel';
import axios from 'axios';
import BaseError from '../utils/classes/BaseErrorClass';

class VercelIntegrationController {
	// save all vercel integration
	async saveIntegration(reqBody: any): Promise<any> {
		const { username, email, token } = reqBody;

		if (!username || !email || !token) {
			throw new BaseError('Missing required fields', 'Validation Error', 400, 'Invalid Request');
		}

		const existingIntegration = await VercelIntegrationModel.findOne({ email });
		if (existingIntegration) {
			throw new BaseError('Integration already exists for this email', 'Duplicate Entry', 400, 'Conflict');
		}

		const newIntegration = new VercelIntegrationModel({ username, email, token });
		await newIntegration.save();

		return { message: 'Integration saved successfully' };
	}

	// list all vercel integration -without any token-
	async listIntegrations(): Promise<any> {
		const integrations = await VercelIntegrationModel.find({}).select('username email createdAt');
		return integrations;
	}

	// fetch vercel projects which are integrated(authorized)
	async getVercelProjects(email: string): Promise<any> {
		const integration = await VercelIntegrationModel.findOne({ email });
		if (!integration) {
			throw new BaseError('Integration not found for the given email', 'Not Found', 404, 'Invalid Email');
		}

		const response = await axios.get('https://api.vercel.com/v9/projects', {
			headers: { Authorization: `Bearer ${integration.token}` }
		});

		return response.data;
	}
}

export default new VercelIntegrationController();
