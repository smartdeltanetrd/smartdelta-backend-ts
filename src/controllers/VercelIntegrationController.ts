import VercelIntegrationModel from '../models/MicroserviceArchitectureModels/VercelModel/VercelIntegrationModel';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import BaseError from '../utils/classes/BaseErrorClass';

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

	async getEncryptedToken(email: string): Promise<any> {
		const integration = await VercelIntegrationModel.findOne({ email });
		if (!integration) {
			throw new BaseError('Integration not found for the given email', 'Not Found', 404, 'Invalid Email');
		}

		return { encryptedToken: integration.token }; // Send encrypted token
	}

	async getVercelProjects(encryptedToken: string): Promise<any> {
		const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key';
		const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
		const token = bytes.toString(CryptoJS.enc.Utf8);

		const response = await axios.get('https://api.vercel.com/v9/projects', {
			headers: { Authorization: `Bearer ${token}` }
		});

		return response.data;
	}
}

export default new VercelIntegrationController();
