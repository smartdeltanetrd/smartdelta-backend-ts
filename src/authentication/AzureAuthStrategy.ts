import { AuthenticationStrategy } from "./ AuthenticationStrategy";

export default class AzureAuthStrategy implements AuthenticationStrategy {
	authenticate(credentials: any): Promise<any> {
		throw new Error("Method not implemented.");
	}
	listClusters(authData: any): Promise<any[]> {
		throw new Error("Method not implemented.");
	}
	
}
