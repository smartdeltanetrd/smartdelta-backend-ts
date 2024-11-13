import { Request, Response, NextFunction } from "express";
import KubernetesController from "../../controllers/KubernetesController";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";

class KubernetesRouterClass extends BaseRouterClass {
  private KubernetesController!: KubernetesController;

  constructor() {
    super();
  }

  async authenticateK8s(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, credentials, authMethod } = req.body;
      this.KubernetesController = new KubernetesController(provider, authMethod, credentials);
      const result = await this.KubernetesController.authenticateK8s(credentials);
      res.status(200).send({
        authResult: result,
        provider,
        credentials,
        authMethod,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async getClusterInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, credentials, authMethod } = req.body;
      if (!provider || !credentials || !authMethod) {
        return res.status(400).send({
          message: "Required credentials are missing. Please re-authenticate.",
        });
      }
      if (!this.KubernetesController) {
        this.KubernetesController = new KubernetesController(provider, authMethod, credentials);
      }
      const result = await this.KubernetesController.getNodes();
      res.status(200).send(result);
    } catch (error) {
      console.error("Error in cluster-info:", error);
      this.handleError(error, next);
    }
  }

  async getPodMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, credentials, authMethod, namespace } = req.body;
      if (!provider || !credentials || !authMethod || !namespace) {
        return res.status(400).send({
          message: "Required parameters are missing. Please provide all necessary information.",
        });
      }
      if (!this.KubernetesController) {
        this.KubernetesController = new KubernetesController(provider, authMethod, credentials);
      }
      const result = await this.KubernetesController.getPodMetrics(namespace);
      res.status(200).send(result);
    } catch (error) {
      console.error("Error in getPodMetrics:", error);
      this.handleError(error, next);
    }
  }

  initRoutes(): void {
    this.router.post('/authenticate', this.authenticateK8s.bind(this));
    this.router.post('/cluster-info', this.getClusterInfo.bind(this));
    this.router.post('/pod-metrics', this.getPodMetrics.bind(this));
  }
}

export const KubernetesRoutes = new KubernetesRouterClass().router;
