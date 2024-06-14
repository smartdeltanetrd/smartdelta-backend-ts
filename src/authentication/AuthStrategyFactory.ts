import { CoreV1Api } from "@kubernetes/client-node";
import KubernetesService from "../services/KubernetesService";
import { AuthenticationStrategy } from "./ AuthenticationStrategy";
import { KubeConfigAuthStrategy } from "./ KubeConfigAuthStrategy";
import AWSAuthStrategy from "./AWSAuthStrategy";
import AzureAuthStrategy from "./AzureAuthStrategy";
import GoogleCloudAuthStrategy from "./GCPAuthentication";


export default class AuthenticationStrategyFactory {
    createStrategy(provider: string | undefined, authMethod: string | undefined, credentials:any): AuthenticationStrategy {
		console.log('AUTH METHOD FACTORY: ', authMethod);
        switch (authMethod) {
            case 'kubeconfig':
				const kubeConfigStrategy = new KubeConfigAuthStrategy(credentials);
				const k8sApi = kubeConfigStrategy.getK8sApi(); // Get the k8sApi instance
				const k8sService = KubernetesService.getInstance();
				k8sService.setK8sApi(k8sApi); // Set k8sApi instance in KubernetesService
				return kubeConfigStrategy;
            case 'serviceAccessToken':
                return this.createServiceAccessTokenStrategy(provider, KubernetesService.getInstance() );
            default:
                throw new Error('Unsupported authentication method');
        }
    }

    private createServiceAccessTokenStrategy(provider: string | undefined, k8sService: KubernetesService): AuthenticationStrategy {
        switch (provider) {
            case 'GCloud':
                return new GoogleCloudAuthStrategy(k8sService);
            case 'AWS':
                return new AWSAuthStrategy();
            case 'Azure':
                return new AzureAuthStrategy();
            default:
                throw new Error('Unsupported provider');
        }
    }
}


