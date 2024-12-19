import VercelIntegrationModel from '../models/MicroserviceArchitectureModels/VercelModel/VercelIntegrationModel';
import axios from 'axios';
import BaseError from '../utils/classes/BaseErrorClass';
import { decryptToken } from '../utils/helpers/encryptions.util';

class VercelIntegrationController {
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

	async listIntegrations(): Promise<any> {
		const integrations = await VercelIntegrationModel.find({}).select('username email createdAt');
		return integrations;
	}

	async getVercelProjects(email: string): Promise<any> {
		try {
			const integration = await VercelIntegrationModel.findOne({ email });
			if (!integration || !integration.token) {
				throw new BaseError('Integration and its token not found for the given email', 'Not Found', 404, 'Invalid Email');
			}
			const token = decryptToken(integration.token);
			const response = await axios.get('https://api.vercel.com/v9/projects', {
				headers: { Authorization: `Bearer ${token}` }
			});
			return response.data;
		} catch (error) {
			console.error('Error while fetching Vercel projects:', error);
			throw new Error('Failed to fetch projects from Vercel. Please check your token.');
		}
	}

	async getEncryptedToken(email: string): Promise<any> {
		const integration = await VercelIntegrationModel.findOne({ email });
		if (!integration) {
			throw new BaseError('Integration not found for the given email', 'Not Found', 404, 'Invalid Email');
		}

		return { encryptedToken: integration.token };
	}

	async deleteAllVercelIntegrations(): Promise<void> {
		const result = await VercelIntegrationModel.deleteMany({});
		console.log(`${result.deletedCount} documents deleted from VercelIntegration collection`);
	}
}

export default new VercelIntegrationController();
