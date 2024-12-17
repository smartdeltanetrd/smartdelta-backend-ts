import mongoose from 'mongoose';

const VercelIntegrationSchema = new mongoose.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

const VercelIntegrationModel = mongoose.model('VercelIntegration', VercelIntegrationSchema);

export default VercelIntegrationModel;
