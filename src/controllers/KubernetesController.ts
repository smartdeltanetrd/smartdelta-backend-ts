import CommonClass from "../utils/classes/CommonClass";
import { AuthenticationStrategy } from "../authentication/ AuthenticationStrategy";
import AuthenticationStrategyFactory from "../authentication/AuthStrategyFactory";
import KubernetesService from "../services/KubernetesService";


export default class KubernetesController extends CommonClass {
	private authStrategy: AuthenticationStrategy;

	constructor(provider: string | undefined, authMethod: string | undefined, credentials:any) {
		super();
		const strategyFactory = new AuthenticationStrategyFactory();
		this.authStrategy = strategyFactory.createStrategy(provider,authMethod,credentials)
	}
	async authenticateK8s( credentials:any):Promise<any> {
		try {
			const authData = await this.authStrategy.authenticate(credentials);
			return authData;
		} catch (error) {
			throw error;
		}
	}
	getNodes(): any {
		return KubernetesService.getInstance().getNodes();
	}

}