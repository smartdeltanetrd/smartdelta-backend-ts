import { Document } from 'mongoose';

export interface IAttachment extends Document {
	owner: string;
	path: string;
	fileSize:number;
	fileName:string;
	fileDescription:String;
	directions: Array<any>;
	nodes: Array<any>;
}
