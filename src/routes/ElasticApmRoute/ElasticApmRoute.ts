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
		return array.some((integration:any) => integration.credentials.cloud.id === cloudId);
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
  
			console.log(log[0]);
            const parts: string[] = req.body.cloud.id.split(':');
            const name: string = parts[0];

            const { cloud, auth } = req.body;

            const { provider, region } = log[0].cloud;
            const { version } = log[0].observer;
            console.log('region: ', region);

            const modified: any = {
				credentials:{
					cloud,
					auth
				},
				provider, 
				region,
                name,
                version,

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
async getMetrics(req: Request, res: Response, next: NextFunction) {
	try {


	  let integrations = await this.ElasticApmController.listAllIntegrations();
	  const { credentials } = integrations[0];

	  const { serviceName } = req.params;
	  let result = await this.ElasticApmController.getMetrics(credentials, serviceName);
	  console.log(result);
	  res.status(200).send(result);
	} catch (error) {
	  this.handleError(error, next);
	}
  }

  async getServices(req: Request, res: Response, next: NextFunction) {
	try {


	  let integrations = await this.ElasticApmController.listAllIntegrations();
	  const { credentials } = integrations[0];
	  let result = await this.ElasticApmController.getServices(credentials);
	  console.log(result);
	  res.status(200).send(result);
	} catch (error) {
	  this.handleError(error, next);
	}
  }
  async getServiceLogs(req: Request, res: Response, next: NextFunction) {
	try {


	  let integrations = await this.ElasticApmController.listAllIntegrations();
	  const { credentials } = integrations[0];
	  const { serviceName } = req.params;
	  let result = await this.ElasticApmController.getServiceLogs(credentials, serviceName );
	  console.log(result);
	  res.status(200).send(result);
	} catch (error) {
	  this.handleError(error, next);
	}
  }
	async getLogs(req: Request, res: Response, next: NextFunction) {
		try {


		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  const { credentials } = integrations[0];
		  let result = await this.ElasticApmController.getLogs(credentials);
		  console.log(result);
		  res.status(200).send(result);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	  async getServiceTransactions(req: Request, res: Response, next: NextFunction) {
		try {

		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  const { credentials } = integrations[0];
		  const { serviceName } = req.params;
		  let result = await this.ElasticApmController.getServiceTransactions(credentials, serviceName);
		  console.log(result);
		  res.status(200).send(result);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	  async getErrors(req: Request, res: Response, next: NextFunction) {
		try {
		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  const { credentials } = integrations[0];
		  const { serviceName } = req.params;
		  const { timeFilter, spanId, traceId, textToInclude } = req.query;
		  const textFilters = {spanId, traceId, textToInclude};
		  let result = await this.ElasticApmController.getErrors(credentials, serviceName,timeFilter, textFilters);
		  console.log('TIME FILTER: ', timeFilter);
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

	async setupMl(req: Request, res: Response, next: NextFunction) {
		try {


		  let integrations = await this.ElasticApmController.listAllIntegrations();
		  const { credentials } = integrations[0];
		  let result = await this.ElasticApmController.setupMl(credentials);
		  console.log(result);
		  res.status(200).send(result);
		} catch (error) {
		  this.handleError(error, next);
		}
	  }
	initRoutes(): void {
		this.router.get('/logs', this.getLogs.bind(this));
		this.router.get('/logs/:serviceName', this.getServiceLogs.bind(this));
		this.router.get('/transactions/:serviceName', this.getServiceTransactions.bind(this));
		this.router.post('/save-integration', this.addNewIntegration.bind(this));
		this.router.get('/integrations', this.getIntegrations.bind(this));
		this.router.get('/metrics/:serviceName', this.getMetrics.bind(this));
		this.router.get('/setup-ml', this.setupMl.bind(this));
		this.router.get('/services', this.getServices.bind(this));
		this.router.get('/errors/:serviceName', this.getErrors.bind(this));

	}
}

export const ElasticApmRoutes = new ElasticApmRouterClass().router;
