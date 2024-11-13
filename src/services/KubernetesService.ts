import { CoreV1Api, KubeConfig, Metrics } from '@kubernetes/client-node';

export default class KubernetesService {
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
      kubeConfig.loadFromString(kubeconfigContent);
  
      // creates Kubernetes API clients for CoreV1Api and Metrics
      this.k8sApi = kubeConfig.makeApiClient(CoreV1Api);
      this.metricsApi = new Metrics(kubeConfig);
  
      if (!this.k8sApi || !this.metricsApi) {
        throw new Error('Kubernetes API client initialization failed.');
      }
    } catch (error) {
      console.error("Failed to initialize Kubernetes API:", error);
      throw new Error(`Kubernetes API initialization error: ${error}`);
    }
  }
  

  async getNodes() {
    if (!this.k8sApi) {
      throw new Error('KubernetesService not authenticated');
    }

    try {
      const response = await this.k8sApi.listNode();
      return response.body.items;
    } catch (error) {
      console.error('Error listing nodes:', error);
      return [];
    }
  }

  async getPodMetrics(namespace: string) {
    if (!this.metricsApi) {
      throw new Error('Metrics API not initialized');
    }

    try {
      const response = await this.metricsApi.getPodMetrics(namespace);
      return response.items;
    } catch (error) {
      console.error('Error fetching pod metrics:', error);
      return [];
    }
  }
}
