import CommonClass from "../utils/classes/CommonClass";
import { AuthenticationStrategy } from "../authentication/ AuthenticationStrategy";
import AuthenticationStrategyFactory from "../authentication/AuthStrategyFactory";
import KubernetesService from "../services/KubernetesService";

export default class KubernetesController extends CommonClass {
  private authStrategy: AuthenticationStrategy;

  constructor(provider: string | undefined, authMethod: string | undefined, credentials: any) {
    super();
    const strategyFactory = new AuthenticationStrategyFactory();
    this.authStrategy = strategyFactory.createStrategy(provider, authMethod, credentials);
  }

  async authenticateK8s(credentials: any): Promise<any> {
    try {
      const authData = await this.authStrategy.authenticate(credentials);
      await KubernetesService.getInstance().initializeK8sApiWithCredentials(credentials);
      console.log('Kubernetes API successfully initialized.');
      return authData;
    } catch (error) {
      console.error('Authentication or Kubernetes API initialization failed:', error);
      throw error;
    }
  }

  async getNodes(): Promise<any> {
    return await KubernetesService.getInstance().getNodes();
  }

  async getPodMetrics(namespace: string): Promise<any> {
    return await KubernetesService.getInstance().getPodMetrics(namespace);
  }
}
