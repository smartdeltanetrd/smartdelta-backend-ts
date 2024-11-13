import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';
import { AuthenticationStrategy } from './ AuthenticationStrategy';
import BaseError from '../utils/classes/BaseErrorClass';

export class KubeConfigAuthStrategy implements AuthenticationStrategy  {
	private k8sApi: CoreV1Api | null = null; 
	private credentials: any;

	constructor(credentials: any) {
		this.credentials = credentials;
    }
	authenticate(credentials: any): any {
		try {
		  const kc = new KubeConfig();
		  kc.loadFromString(this.credentials);
	  
		  // Ensure context and cluster details are correctly set
		  const context = kc.getCurrentContext();
		  if (!context) {
			throw new Error("No valid context in kubeconfig");
		  }
	  
		  this.k8sApi = kc.makeApiClient(CoreV1Api);
	  
		  return { message: 'Authentication Successful', info: 'Cluster Monitoring enabled' };
		} catch (error) {
			if (error instanceof Error) {
				throw new BaseError(
				  `Please provide valid credentials. Error: ${error.message}`,
				  'Unauthorized', 
				  401,
				  'Authentication Failed'
				);
			  } else {
				throw new BaseError(
				  'Please provide valid credentials. Unknown error occurred.',
				  'Unauthorized', 
				  401,
				  'Authentication Failed'
				);
			  }
		}
	  }
	  
	listClusters(authData: any): Promise<any[]> {
		throw new Error('Method not implemented.');
	}

	getK8sApi(): CoreV1Api | null {
        return this.k8sApi;
    }

}
