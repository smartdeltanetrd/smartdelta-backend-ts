import mongoose, { Document, Model } from 'mongoose';

interface IVercelIntegration extends Document {
	username: string;
	email: string;
	token: string; // encrypted token
	createdAt: Date;
}

const VercelIntegrationSchema = new mongoose.Schema<IVercelIntegration>({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

const VercelIntegrationModel: Model<IVercelIntegration> = mongoose.model('VercelIntegration', VercelIntegrationSchema);

export default VercelIntegrationModel;
