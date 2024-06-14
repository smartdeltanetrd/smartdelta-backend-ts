export interface AuthenticationStrategy {
    authenticate(credentials:any): void;
	listClusters(authData: any): Promise<any[]>;
}
