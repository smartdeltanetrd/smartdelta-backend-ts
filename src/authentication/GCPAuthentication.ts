import KubernetesService from '../services/KubernetesService';
import { AuthenticationStrategy } from './ AuthenticationStrategy';

import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

export default class GoogleCloudAuthStrategy implements AuthenticationStrategy {
	private k8sService: KubernetesService;
	constructor(k8sService: KubernetesService) {
		this.k8sService = k8sService;
	}

	async authenticate(credentials: any): Promise<any> {
		console.log(credentials);
		const kc = new KubeConfig();
		kc.loadFromString(credentials);
		const context = kc.getCurrentContext();
		console.log(context);
		const k8sApi = kc.makeApiClient(CoreV1Api);
		const response = await k8sApi.listNode();
		for (const node of response.body.items) {
			const nodeName = node.metadata?.name ?? 'Unknown Node';
			console.log('Node:', nodeName);
		}
	}

	listClusters(authData: any): Promise<any[]> {
		throw new Error('Method not implemented.');
	}
}
