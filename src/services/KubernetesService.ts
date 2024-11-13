import { CoreV1Api, KubeConfig, Metrics } from '@kubernetes/client-node';

export default class KubernetesService {
	// TODO:: CoreV1Api is problematic for v1beta1 authentication
	private static instance: KubernetesService | null = null;
	private k8sApi: CoreV1Api | null = null;
	private metricsApi: Metrics | null = null;

	private constructor() {}

	static getInstance(): KubernetesService {
		if (!KubernetesService.instance) {
			KubernetesService.instance = new KubernetesService();
		}
		return KubernetesService.instance;
	}

	setK8sApi(k8sApi: CoreV1Api | null) {
		this.k8sApi = k8sApi;
	}

	setMetricsApi(metricsApi: Metrics | null) {
		this.metricsApi = metricsApi;
	}

	async initializeK8sApiWithCredentials(kubeconfigContent: string) {
		const kubeConfig = new KubeConfig();

		try {
			console.log('KUBECONFIG CONTENT:', kubeconfigContent);
			kubeConfig.loadFromString(kubeconfigContent);

			const context = kubeConfig.getCurrentContext();
			if (!context) {
				throw new Error('No valid context in kubeconfig');
			}
			console.log('KUBECONFIG CONTEXT:', context);

			const user = kubeConfig.getUser(context);
			const cluster = kubeConfig.getCluster(context);
			console.log('User:', user);
			console.log('Cluster:', cluster);

			// set apiVersion to v1beta1 if exec auth is used
			if (user?.exec) {
				user.exec.apiVersion = 'client.authentication.k8s.io/v1beta1';
				console.log('Using exec authentication with:', user.exec);
			}

			this.setK8sApi(kubeConfig.makeApiClient(CoreV1Api));
			this.setMetricsApi(new Metrics(kubeConfig));

			console.log('K8S API Initialized:', this.k8sApi);
			console.log('METRICS API Initialized:', this.metricsApi);

			if (!this.k8sApi || !this.metricsApi) {
				throw new Error('Kubernetes API client initialization failed.');
			}
		} catch (error) {
			console.error('Failed to initialize Kubernetes API:', error);
			throw new Error(`Kubernetes API initialization error: ${error instanceof Error ? error.message : error}`);
		}
	}

	async getNodes() {
		if (!this.k8sApi) {
			throw new Error('KubernetesService not authenticated');
		}

		try {
			const response = await this.k8sApi.listNode();
			console.log('NODES:', response.body.items);
			return response.body.items;
		} catch (error) {
			console.error('Error listing nodes:', error instanceof Error ? error.message : error);
			throw new Error('Failed to list nodes due to authentication or configuration issue.');
		}
	}

	async getPodMetrics(namespace: string) {
		if (!this.metricsApi) {
			throw new Error('Metrics API not initialized');
		}

		try {
			const response = await this.metricsApi.getPodMetrics(namespace);
			console.log('POD METRICS:', response.items);
			return response.items;
		} catch (error) {
			console.error('Error fetching pod metrics:', error instanceof Error ? error.message : error);
			throw new Error('Failed to fetch pod metrics due to authentication or configuration issue.');
		}
	}
}
