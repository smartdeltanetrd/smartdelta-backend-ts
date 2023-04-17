import { Document } from 'mongoose';

export interface IAttachment extends Document {
	owner: string;
	path: string;
	directions: Array<any>;
	nodes: Array<any>;
}
