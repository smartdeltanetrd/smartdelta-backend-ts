
import BaseError from '../utils/classes/BaseErrorClass';
import CommonClass from '../utils/classes/CommonClass';
import axios from 'axios';
import { Client } from '@elastic/elasticsearch';
import { IElasticIntegration } from '../utils/interfaces/IModels/IElastic.interface';
import ElasticIntegrationModel from '../models/UserModel/ElasticIntegrationModel';

interface FaasInfo {
    duration: number;
    billed_duration: number;
    coldstart: boolean;
}

interface SystemInfo {
    memory: {
        actual: {
            free: number;
        };
    };
}

interface ObjectItem {
    faas: FaasInfo;
    system: SystemInfo;
    // Add other relevant properties as needed
}



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
			let integrations = await ElasticIntegrationModel.find({}).select([ 'credentials', 'name', 'version','provider','region']);
			console.log(integrations);
			return integrations;
		} catch (error) {
			throw error;
		}
	}

	async getMetrics(credentials:any,serviceName:string): Promise<any> {
		try {
			console.log('CREDENTIALS: ', credentials);
			const client = new Client(credentials);

      const response = await client.search({
        index: '.ds-metrics-apm.internal-default-2024.02.07-000001',
      });

	  
	
  // Process the response and retrieve the corresponed service s APM logs
  const apmLogs = response.hits.hits.map((hit:any) => hit._source);
  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName);
  const sparklineData = {
	functionDuration: filteredLogs.map((log: any) => ({
	  timestamp: log['@timestamp'],
	  duration: log.faas.duration,
	})),
	billedDuration: filteredLogs.map((log: any) => ({
	  timestamp: log['@timestamp'],
	  billedDuration: log.faas.billed_duration,
	})),
	memoryUsage: filteredLogs.map((log: any) => ({
	  timestamp: log['@timestamp'],
	  freeMemory: log.system.memory.actual.free,
	  totalMemory: log.system.memory.total,
	})),
  };
 console.log( apmLogs);
 
/*
			const resp = await client.cat.indices({
				index: "*",
				v: true,
				s: "index"
			  });

			  console.log('CAT INDICES: ');
	  console.log(resp);
	   .ds-metrics-apm.service_transaction.1m-default-2024.02.07-000001 
*/

  return {
	sparklineData
  };
  }
		catch (err:any) {
			console.error('Error occurred while running the Python script:', err);
		throw new BaseError(
			err.message || 'Error occurred while fetching logs from Elastic APM:',
			'Elastic apm  log fetchıng failed',
			500,
			'Wrong password or username'
		);

		  }
	}
	async getServices(credentials:any): Promise<any> {
		try {
			const client = new Client(credentials);

			const response = await client.search({
				index: '.ds-metrics-apm.internal-default-*',
				body: {
					query: {
						range: {
							'@timestamp': {
								gte: 'now-30d/d',
								lte: 'now/d'
							}
						}
					}
				}
			});

			
		/*	const resp = await client.cat.indices({
				index: "*",
				v: true,
				s: "index"
			  });

			  console.log('CAT INDICES: ');
	  console.log(resp);
*/


	  
	
  // Process the response and retrieve the APM logs
  const apmLogs = response.hits.hits.map((hit:any) => hit._source);
  //
  /*const res = await client.search({
	index: '.ds-traces-apm-default-2024.04.07-000004',
	//.ds-traces-apm-default-2024.02.07-000001 **
	//metrics-endpoint.metadata_current_default
	//
	//.ds-metrics-apm.service_destination.1m-default-2024.02.07-000001
  });
  */

 /* const Logs = response.hits.hits.map((hit:any) => hit._source)*/

  //

  console.log("HERE IS APM LOGS: ")

  const uniqueServicesMap = new Map();
 apmLogs.forEach(log => {
    const serviceName = log.service.name;
   
    if (!uniqueServicesMap.has(serviceName)) {
        uniqueServicesMap.set(serviceName, log.service);
    }
});

const uniqueServiceObjects = Array.from(uniqueServicesMap.values());

	  return uniqueServiceObjects;
	


		  } catch (err:any) {
			console.error('Error occurred while getting services', err);
		throw new BaseError(
			err.message || 'Error occurred while getting Services from Elastic APM:',
			'Elastic apm  getting services failed',
			500,
			'Wrong password or username'
		);

		  }
	}
	async getLogs(credentials:any): Promise<any> {
		try {
			const client = new Client(credentials);


      const response = await client.search({
        index: '.ds-metrics-apm.transaction.1m-default-*',
      });
	  

	  const apmLogs = response.hits.hits.map((hit:any) => hit._source);

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
	

	async getServiceLogs(credentials:any,serviceName:string): Promise<any> {
		try {
			const client = new Client(credentials);
		  const lowercaseServiceName = serviceName.toLowerCase().replace(/-/g, '_');
		const index= `.ds-logs-apm.app.${lowercaseServiceName}-default-*`;
      const response = await client.search({
        index
      });
	  
	  const apmLogs = response.hits.hits.map((hit:any) => hit._source);
	  
	  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName).map(obj => ({
		timestamp: obj['@timestamp'],
		message: obj.message
	  }));
	  

	  return filteredLogs;
	


		  } catch (err:any) {
			console.error('Error occurred while running the get service log:', err);
		throw new BaseError(
			err.message || 'Error occurred while fetching service logs from Elastic APM:',
			'Elastic apm  log fetchıng failed',
			500,
			'Wrong password or username'
		);

		  }
	}
	async getServiceTransactions(credentials:any,serviceName:string): Promise<any> {
		try {
			const client = new Client(credentials);


      const response = await client.search({
        index: '.ds-traces-apm-default-*',
		//.ds-traces-apm-default-2024.02.07-000001 **
		//metrics-endpoint.metadata_current_default
		//
		//.ds-metrics-apm.service_destination.1m-default-2024.02.07-000001
      });
	  

	  const apmLogs = response.hits.hits.map((hit:any) => hit._source);
	  
	/*  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName).map(obj => ({
		timestamp: obj['@timestamp'],
		message: obj.message
	  }));
	  */

	  return apmLogs;
	


		  } catch (err:any) {
			console.error('Error occurred while running the get service log:', err);
		throw new BaseError(
			err.message || 'Error occurred while fetching service logs from Elastic APM:',
			'Elastic apm  log fetchıng failed',
			500,
			'Wrong password or username'
		);

		  }
	}
	async getErrors(credentials:any,serviceName:string, timeFilter:any, textFilters:any): Promise<any> {
		try {
			const client = new Client(credentials);

      const response = await client.search({
        index: '.ds-logs-apm.error-default-*',
		//.ds-traces-apm-default-2024.02.07-000001 **
		//metrics-endpoint.metadata_current_default
		//
		//.ds-metrics-apm.service_destination.1m-default-2024.02.07-000001
      });
	  

	  const apmLogs = response.hits.hits.map((hit:any) => hit._source);

	  const { traceId, spanId, textToInclude } = textFilters;
	  const filtersToApply = new Map();
	  if(traceId) filtersToApply.set('trace', traceId)
	  if(spanId) filtersToApply.set('span', spanId);
	  if(textToInclude) filtersToApply.set('message', textToInclude);
	 
	  const filteredLogs = apmLogs.filter(log => {
		const logIngestedTime = new Date(log.event.ingested);
		console.log('logIngestedTime:', logIngestedTime);
		const filterTime = new Date(timeFilter);
		console.log('filterTime:', filterTime);
		console.log('timeFilter:', timeFilter);

		if (!(logIngestedTime > filterTime)) {
			return false;
		}
	
		// Dynamically apply additional filters
		for (const [key, value] of filtersToApply.entries()) {
			if(key == 'span' || key ==  "trace"){
			if (log[key].id !== value) {
				return false; // Log doesn't match the filter
			}
		  }else{
			console.log("LOG MESSAGE: ",log.message)
			if(!log.message.includes(value)){
				return false;
			
			}
		  }
		}
	
		return true
	});

	return filteredLogs;
	/*  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName).map(obj => ({
		timestamp: obj['@timestamp'],
		message: obj.message
	  }));
	  */
	 console.log("HERE IS APM LOGS: ")
	 console.log(JSON.stringify(apmLogs));

	  return apmLogs;
	


		  } catch (err:any) {
			console.error('Error occurred while running the get service log:', err);
		throw new BaseError(
			err.message || 'Error occurred while fetching service logs from Elastic APM:',
			'Elastic apm  log fetchıng failed',
			500,
			'Wrong password or username'
		);

		  }
	}
	async setupMl(credentials:any): Promise<any> {
		try {
			
	

			const client = new Client(credentials);


      const response = await client.search({
        index: '.ds-logs-apm.app.floravisioncloudstack_sensordataprocessor2b2527c2_j9n7owugmsnj-default-*',
      });

	  

	  const apmLogs = response.hits.hits.map((hit:any) => hit._source);

	  		/*	// Send POST request to the Flask API
			const apiResponse = await axios.post('http://127.0.0.1:5006/categorical_comparison', formData, {
			  headers: formData.getHeaders()
			});
		*/
			// Assuming your Flask API returns some data
			//const responseData = apiResponse.data;
			const flaskResponse = await axios.post('http://127.0.0.1:5006/anomaly_detection', { data: apmLogs });

	  return flaskResponse.data;
	


		  } catch (err:any) {
			console.error('Error occurred while running the Python script:', err);
		throw new BaseError(
			err.message || 'Error occurred while doing anomaly detection:',
			'anomaly detection failed',
			500,
			''
		);

		  }
	}

	



}
