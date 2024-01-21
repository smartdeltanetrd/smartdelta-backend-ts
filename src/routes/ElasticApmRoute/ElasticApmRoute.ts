import { NextFunction, Request, Response } from "express";
import BaseRouterClass from "../../utils/classes/BaseRouterClass";
import ElasticApmController from "../../controllers/ElasticApmController";
import BaseError from "../../utils/classes/BaseErrorClass";
import { IElasticIntegration } from "../../utils/interfaces/IModels/IElastic.interface";

class ElasticApmRouterClass extends BaseRouterClass {
	private ElasticApmController: ElasticApmController;
	constructor() {
		super();
		this.ElasticApmController = new ElasticApmController();
	}
	 isCloudIdExists(array:any, cloudId:string) {
		return array.some((integration:any) => integration.cloud.id === cloudId);
	  }
	  async addNewIntegration(req: Request, res: Response, next: NextFunction) {
		try {
			// Check if file exists in request
			if (!req.body) {
				return next(
					new BaseError(
						'Credentials parameters are not provided in the request object',
						'Bad Request',
						400,
						'Bad Request Occurred While Adding Integration'
					)
				);
			}
	
			const log = await this.ElasticApmController.getLogs(req.body);
	
			if (!log) {
				return res.status(400).json({
					message: 'Authentication failed',
					info: 'Wrong password or username',
					result: null
				});
			}
	
			const integrations = await this.ElasticApmController.listAllIntegrations();
			const cloudIdExists = this.isCloudIdExists(integrations, req.body.cloud.id);
	
			if (!cloudIdExists) {
				console.log(req.body);
	
				const parts: string[] = req.body.cloud.id.split(':');
				const name: string = parts[0];
	
				const { cloud, auth } = req.body;
				const { provider, region } = log[0].cloud;
				const { version } = log[0].observer;
				console.log('region: ', region);
	
				const modified: any = {
					cloud: { ...cloud, provider, region },
					name,
					version,
					auth: { ...auth },
				};
	
				const result = await this.ElasticApmController.saveIntegration(modified);
	
				return res.status(201).json({
					message: 'Saving elastic integration completed successfully.',
					log,
					info: result
				});
			}
	
			return res.status(400).json({
				message: 'Cloud ID already exists',
				info: 'You cannot add the same Cloud ID',
				result: null
			});
		} catch (error) {
			this.handleError(error, next);
		}
	}
	
	async getLogs(req: Request, res: Response, next: NextFunction) {
		try {


		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  let result = await this.ElasticApmController.getLogs(integrations[0]);
		  console.log(result);
		  res.status(200).send(result);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	  async getIntegrations(req: Request, res: Response, next: NextFunction) {
		try {


		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  if(integrations.length == 0) res.status(400).send({message:'No integration found'});
		 
		  console.log(integrations[0]);
		  res.status(200).send(integrations[0]);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	initRoutes(): void {
		this.router.get('/logs', this.getLogs.bind(this));
		this.router.post('/save-integration', this.addNewIntegration.bind(this));
		this.router.get('/integrations', this.getIntegrations.bind(this));

	}
}

export const ElasticApmRoutes = new ElasticApmRouterClass().router;
