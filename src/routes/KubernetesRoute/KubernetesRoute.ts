import { Request, Response, NextFunction } from "express";
import KubernetesController from "../../controllers/KubernetesController";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";
import { User } from "../../express-session";

class KubernetesRouterClass extends BaseRouterClass{
	private KubernetesController!: KubernetesController;
	constructor() {
		super();
	}
	async authenticateK8s(req: Request, res: Response, next: NextFunction) {
		try {
			const { provider, credentials, authMethod } = req.body;
			if (!req.session.user) {
				req.session.user = {};
			  }
			  req.session.user.provider = provider;
			  req.session.user.credentials = credentials;
			  req.session.user.authMethod = authMethod;


			this.KubernetesController = new KubernetesController(provider,authMethod,credentials);

			let result = await this.KubernetesController.authenticateK8s(credentials);
		
			
			res.status(200).send(result);
		} catch (error) {
			this.handleError(error, next);
		}
	}
	async getClusterInfo(req: Request, res: Response, next: NextFunction) {
		try {
			const credentials = req.session.user?.credentials;
			const provider = req.session.user?.provider;
			const authMethod = req.session.user?.authMethod;
			console.log("CREdentıals: " + credentials);
			console.log('AUTH METHOD cluster route: ', authMethod);
			this.KubernetesController = new KubernetesController(provider,authMethod,credentials);
			let result = await this.KubernetesController.getNodes();
			console.log(result);
			res.status(200).send(result);
			
		} catch (error) {
			this.handleError(error, next);
		}
	}
	
	initRoutes(): void {
		this.router.post('/authenticate',this.authenticateK8s.bind(this));
		this.router.get('/cluster-info',this.getClusterInfo.bind(this));
	}
}

export const KubernetesRoutes = new KubernetesRouterClass().router;