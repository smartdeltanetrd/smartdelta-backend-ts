import { CoreV1Api } from '@kubernetes/client-node';

export default class KubernetesService {
  private static instance: KubernetesService | null = null;
  private k8sApi: CoreV1Api | null = null;

  private constructor() {
    // Initialize with no k8sApi instance
  }

  static getInstance(): KubernetesService {
    if (!KubernetesService.instance) {
      KubernetesService.instance = new KubernetesService();
    }
    return KubernetesService.instance;
  }
  setK8sApi(k8sApi: CoreV1Api | null) {
    this.k8sApi = k8sApi;
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
}
