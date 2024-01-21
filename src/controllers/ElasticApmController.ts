
import BaseError from '../utils/classes/BaseErrorClass';
import CommonClass from '../utils/classes/CommonClass';
import axios from 'axios';
import { Client } from '@elastic/elasticsearch';
import { IElasticIntegration } from '../utils/interfaces/IModels/IElastic.interface';
import ElasticIntegrationModel from '../models/UserModel/ElasticIntegrationModel';


export default class ElasticApmController extends CommonClass {
	constructor() {
		super();
	}
	async saveIntegration(newIntegration: IElasticIntegration): Promise<any> {
		try {
			let integration = new ElasticIntegrationModel(newIntegration);
			await integration.save();
			this.infoLogger('New Attachment Created');
			return integration;
		} catch (error: any) {
			throw new BaseError(
				error.message || 'Error happened while Adding Integration',
				'Integration Could Not Added',
				500,
				'Integration Saving Error'
			);
		}
	}
	async listAllIntegrations(): Promise<any> {
		try {
			let integrations = await ElasticIntegrationModel.find({}).select([ 'cloud', 'name', 'version']);
			console.log(integrations);
			return integrations;
		} catch (error) {
			throw error;
		}
	}



	async getLogs(credentials:any): Promise<any> {
		try {
			const client = new Client(credentials);


      const response = await client.search({
        index: '.ds-metrics-apm.transaction.1m-default-2024.01.15-000001',
      });
	  

  // Process the response and retrieve the APM logs
  const apmLogs = response.hits.hits.map((hit:any) => hit._source);
  //console.log(apmLogs);
  return apmLogs;


		  } catch (err:any) {
			console.error('Error occurred while running the Python script:', err);
		throw new BaseError(
			err.message || 'Error occurred while fetching logs from Elastic APM:',
			'Elastic apm  log fetchıng failed',
			500,
			'Wrong password or username'
		);

		  }
	}

	



}
