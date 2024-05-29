import { Document } from "mongoose";

export interface IElasticIntegration extends Document {
	credentials: {
		cloud: {
			id: String;
		};
		auth: {
			username: String;
			password: String;
			  };
	};
	provider: String;
	regions: String;
	name: String;
	version: String;

}

