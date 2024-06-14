import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { AuthenticationStrategy } from './ AuthenticationStrategy';
import BaseError from '../utils/classes/BaseErrorClass';

export class KubeConfigAuthStrategy implements AuthenticationStrategy  {
	private k8sApi: CoreV1Api | null = null; // Initialize as null
	private credentials: any;

	constructor(credentials: any) {
		this.credentials = credentials;
    }
	authenticate(credentials: any):  any {
		try{
			const kc = new KubeConfig();
			kc.loadFromString(this.credentials);
			this.k8sApi = kc.makeApiClient(CoreV1Api)
			return {message: 'Authentication Successful', info:'Cluster Monitoring enabled'}
		}
		catch(error){
			throw new BaseError(
				`Please provide valid credentials`,
				'Unauthorized', 
				401,
				'Authentication Failed'
			)
		}
	
	}
	listClusters(authData: any): Promise<any[]> {
		throw new Error('Method not implemented.');
	}

	getK8sApi(): CoreV1Api | null {
        return this.k8sApi;
    }

}
