import { Document } from "mongoose";

export interface IElasticIntegration extends Document {
	cloud: {
		id: String;
		provider: String;
		regions: String;
	},
	name: String;
	version: String;
	auth: {
	username: String;
	  }
}

