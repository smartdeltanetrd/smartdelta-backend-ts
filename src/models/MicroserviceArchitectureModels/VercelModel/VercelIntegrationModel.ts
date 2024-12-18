import mongoose, { Document, Model } from 'mongoose';
import CryptoJS from 'crypto-js';

interface IVercelIntegration extends Document {
	username: string;
	email: string;
	token: string;
	createdAt: Date;
	decryptToken(): string;
}

const VercelIntegrationSchema = new mongoose.Schema<IVercelIntegration>({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

// Encrypts token before saving
VercelIntegrationSchema.pre('save', function (next) {
	if (this.isModified('token')) {
		const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key';
		this.token = CryptoJS.AES.encrypt(this.token, secretKey).toString();
	}
	next();
});

// Decrypts token method
VercelIntegrationSchema.methods.decryptToken = function () {
	const secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key';
	const bytes = CryptoJS.AES.decrypt(this.token, secretKey);
	return bytes.toString(CryptoJS.enc.Utf8);
};

const VercelIntegrationModel: Model<IVercelIntegration> = mongoose.model('VercelIntegration', VercelIntegrationSchema);

export default VercelIntegrationModel;
