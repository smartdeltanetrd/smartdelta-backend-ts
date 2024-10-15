import BaseError from '../utils/classes/BaseErrorClass';
import CommonClass from '../utils/classes/CommonClass';
import axios from 'axios';
import { Client } from '@elastic/elasticsearch';
import { IElasticIntegration } from '../utils/interfaces/IModels/IElastic.interface';
import ElasticIntegrationModel from '../models/UserModel/ElasticIntegrationModel';
import TraceSpansClass from '../utils/classes/TraceSpansClass';

interface APMLog {
	service: {
		name: string;
		[key: string]: any; // Adjust this if you have specific fields
	};
	[key: string]: any; // Adjust this if you have specific fields
}

interface SearchResponse {
	hits: {
		hits: Array<{
			_source: APMLog;
		}>;
	};
}

interface CountResponse {
	count: number;
}

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

	trackSpanMockData: any = {
		sparklineData: {
			functionDuration: [
				{
					timestamp: '2024-08-28T17:17:44.267Z',
					freeMemory: 10485760,
					totalMemory: 134217728
				},
				{
					timestamp: '2024-08-28T17:17:41.483Z',
					freeMemory: 10485760,
					totalMemory: 134217728
				}
			]
		},
		traces: [
			{
				parent: {
					id: '69e584ca5f154775'
				},
				agent: {
					activation_method: 'aws-lambda-layer',
					name: 'nodejs',
					version: '4.5.2'
				},
				process: {
					args: ['/var/lang/bin/node', '/var/runtime/index.mjs'],
					parent: {
						pid: 1
					},
					pid: 16,
					title: '/var/lang/bin/node'
				},
				destination: {
					address: 'dynamodb.us-east-1.amazonaws.com',
					port: 443
				},
				processor: {
					event: 'span'
				},
				url: {
					original: 'https://dynamodb.us-east-1.amazonaws.com/'
				},
				cloud: {
					provider: 'aws',
					service: {
						name: 'lambda'
					},
					region: 'us-east-1',
					account: {
						id: '696774395662'
					}
				},
				observer: {
					hostname: '42c0295cea9d',
					type: 'apm-server',
					version: '8.12.1'
				},
				trace: {
					id: '1ceaf1a1a3efeef48ed52c9b10b3f9b3'
				},
				'@timestamp': '2024-08-29T09:02:52.344Z',
				data_stream: {
					namespace: 'default',
					type: 'traces',
					dataset: 'apm'
				},
				service: {
					node: {
						name: '2024/08/29/[$LATEST]21a516abf2f742a0a33d178f1c2c8ccf'
					},
					environment: 'development',
					framework: {
						name: 'AWS Lambda'
					},
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					runtime: {
						name: 'AWS_Lambda_nodejs18.x',
						version: '18.20.4'
					},
					language: {
						name: 'javascript'
					},
					version: '$LATEST',
					target: {
						name: 'dynamodb.us-east-1.amazonaws.com:443',
						type: 'http'
					}
				},
				host: {
					hostname: '169.254.63.53',
					os: {
						platform: 'linux'
					},
					ip: ['44.201.100.130'],
					name: '169.254.63.53',
					architecture: 'x64'
				},
				http: {
					request: {
						method: 'POST'
					},
					response: {
						status_code: 200
					}
				},
				event: {
					agent_id_status: 'missing',
					ingested: '2024-08-29T09:02:58Z',
					success_count: 1,
					outcome: 'success'
				},
				transaction: {
					id: '69e584ca5f154775'
				},
				span: {
					duration: {
						us: 5869
					},
					representative_count: 1,
					subtype: 'http',
					destination: {
						service: {
							resource: 'dynamodb.us-east-1.amazonaws.com:443'
						}
					},
					name: 'POST dynamodb.us-east-1.amazonaws.com',
					action: 'POST',
					id: '34cfbd72c93af221',
					type: 'external',
					sync: false
				},
				timestamp: {
					us: 1724922172344203
				}
			},
			{
				agent: {
					activation_method: 'aws-lambda-layer',
					name: 'nodejs',
					version: '4.5.2'
				},
				faas: {
					execution: '89cfbd1e-9206-4393-b6ec-c6267b9c87ae',
					coldstart: false,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: 'arn:aws:lambda:us-east-1:696774395662:function:FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					trigger: {
						type: 'other'
					},
					version: '$LATEST'
				},
				process: {
					args: ['/var/lang/bin/node', '/var/runtime/index.mjs'],
					parent: {
						pid: 1
					},
					pid: 16,
					title: '/var/lang/bin/node'
				},
				processor: {
					event: 'transaction'
				},
				cloud: {
					provider: 'aws',
					service: {
						name: 'lambda'
					},
					origin: {
						provider: 'aws'
					},
					region: 'us-east-1',
					account: {
						id: '696774395662'
					}
				},
				observer: {
					hostname: '42c0295cea9d',
					type: 'apm-server',
					version: '8.12.1'
				},
				trace: {
					id: '1ceaf1a1a3efeef48ed52c9b10b3f9b3'
				},
				'@timestamp': '2024-08-29T09:02:52.321Z',
				data_stream: {
					namespace: 'default',
					type: 'traces',
					dataset: 'apm'
				},
				service: {
					node: {
						name: '2024/08/29/[$LATEST]21a516abf2f742a0a33d178f1c2c8ccf'
					},
					environment: 'development',
					framework: {
						name: 'AWS Lambda'
					},
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					runtime: {
						name: 'AWS_Lambda_nodejs18.x',
						version: '18.20.4'
					},
					language: {
						name: 'javascript'
					},
					version: '$LATEST'
				},
				host: {
					hostname: '169.254.63.53',
					os: {
						platform: 'linux'
					},
					ip: ['44.201.100.130'],
					name: '169.254.63.53',
					architecture: 'x64'
				},
				event: {
					agent_id_status: 'missing',
					ingested: '2024-08-29T09:02:58Z',
					success_count: 1,
					outcome: 'success'
				},
				transaction: {
					result: 'success',
					duration: {
						us: 29535
					},
					representative_count: 1,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: '69e584ca5f154775',
					span_count: {
						started: 1
					},
					type: 'request',
					sampled: true
				},
				span: {
					id: '69e584ca5f154775'
				},
				timestamp: {
					us: 1724922172321008
				}
			},
			{
				agent: {
					activation_method: 'aws-lambda-layer',
					name: 'nodejs',
					version: '4.5.2'
				},
				faas: {
					execution: '399cf335-6b0a-4253-b299-77aab89c3335',
					coldstart: true,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: 'arn:aws:lambda:us-east-1:696774395662:function:FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					trigger: {
						type: 'other'
					},
					version: '$LATEST'
				},
				process: {
					args: ['/var/lang/bin/node', '/var/runtime/index.mjs'],
					parent: {
						pid: 1
					},
					pid: 16,
					title: '/var/lang/bin/node'
				},
				processor: {
					event: 'transaction'
				},
				cloud: {
					provider: 'aws',
					service: {
						name: 'lambda'
					},
					origin: {
						provider: 'aws'
					},
					region: 'us-east-1',
					account: {
						id: '696774395662'
					}
				},
				observer: {
					hostname: '42c0295cea9d',
					type: 'apm-server',
					version: '8.12.1'
				},
				trace: {
					id: 'b6c254b6abf265efa85377bf58dbd1df'
				},
				'@timestamp': '2024-08-28T17:17:40.464Z',
				data_stream: {
					namespace: 'default',
					type: 'traces',
					dataset: 'apm'
				},
				service: {
					node: {
						name: '2024/08/28/[$LATEST]634371f4aef54de6b027ffba3111013a'
					},
					environment: 'development',
					framework: {
						name: 'AWS Lambda'
					},
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					runtime: {
						name: 'AWS_Lambda_nodejs18.x',
						version: '18.20.4'
					},
					language: {
						name: 'javascript'
					},
					version: '$LATEST'
				},
				host: {
					hostname: '169.254.83.157',
					os: {
						platform: 'linux'
					},
					ip: ['34.226.192.237'],
					name: '169.254.83.157',
					architecture: 'x64'
				},
				event: {
					agent_id_status: 'missing',
					ingested: '2024-08-28T17:17:45Z',
					success_count: 1,
					outcome: 'success'
				},
				transaction: {
					result: 'success',
					duration: {
						us: 781493
					},
					representative_count: 1,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: '8e2225ffb7a4370f',
					span_count: {
						started: 1
					},
					type: 'request',
					sampled: true
				},
				span: {
					id: '8e2225ffb7a4370f'
				},
				timestamp: {
					us: 1724865460464043
				}
			},
			{
				agent: {
					activation_method: 'aws-lambda-layer',
					name: 'nodejs',
					version: '4.5.2'
				},
				faas: {
					execution: 'f368ea1f-a1b1-48e7-b05f-b247c023af4d',
					coldstart: false,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: 'arn:aws:lambda:us-east-1:696774395662:function:FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					trigger: {
						type: 'other'
					},
					version: '$LATEST'
				},
				process: {
					args: ['/var/lang/bin/node', '/var/runtime/index.mjs'],
					parent: {
						pid: 1
					},
					pid: 16,
					title: '/var/lang/bin/node'
				},
				processor: {
					event: 'transaction'
				},
				cloud: {
					provider: 'aws',
					service: {
						name: 'lambda'
					},
					origin: {
						provider: 'aws'
					},
					region: 'us-east-1',
					account: {
						id: '696774395662'
					}
				},
				observer: {
					hostname: '42c0295cea9d',
					type: 'apm-server',
					version: '8.12.1'
				},
				trace: {
					id: '61e4c3b4a7b74a7bc7993e9d27cf36e6'
				},
				'@timestamp': '2024-08-28T17:17:54.326Z',
				data_stream: {
					namespace: 'default',
					type: 'traces',
					dataset: 'apm'
				},
				service: {
					node: {
						name: '2024/08/28/[$LATEST]634371f4aef54de6b027ffba3111013a'
					},
					environment: 'development',
					framework: {
						name: 'AWS Lambda'
					},
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					runtime: {
						name: 'AWS_Lambda_nodejs18.x',
						version: '18.20.4'
					},
					language: {
						name: 'javascript'
					},
					version: '$LATEST'
				},
				host: {
					hostname: '169.254.83.157',
					os: {
						platform: 'linux'
					},
					ip: ['34.226.192.237'],
					name: '169.254.83.157',
					architecture: 'x64'
				},
				event: {
					agent_id_status: 'missing',
					ingested: '2024-08-28T17:17:55Z',
					success_count: 1,
					outcome: 'success'
				},
				transaction: {
					result: 'success',
					duration: {
						us: 97633
					},
					representative_count: 1,
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					id: 'd3faa6c5de06e8c9',
					span_count: {
						started: 1
					},
					type: 'request',
					sampled: true
				},
				span: {
					id: 'd3faa6c5de06e8c9'
				},
				timestamp: {
					us: 1724865474326008
				}
			},
			{
				parent: {
					id: 'e7af356a90fd2029'
				},
				agent: {
					activation_method: 'aws-lambda-layer',
					name: 'nodejs',
					version: '4.5.2'
				},
				process: {
					args: ['/var/lang/bin/node', '/var/runtime/index.mjs'],
					parent: {
						pid: 1
					},
					pid: 16,
					title: '/var/lang/bin/node'
				},
				destination: {
					address: 'dynamodb.us-east-1.amazonaws.com',
					port: 443
				},
				processor: {
					event: 'span'
				},
				url: {
					original: 'https://dynamodb.us-east-1.amazonaws.com/'
				},
				cloud: {
					provider: 'aws',
					service: {
						name: 'lambda'
					},
					region: 'us-east-1',
					account: {
						id: '696774395662'
					}
				},
				observer: {
					hostname: '42c0295cea9d',
					type: 'apm-server',
					version: '8.12.1'
				},
				trace: {
					id: 'd1899aabc6b94332bbdec211386ec5c4'
				},
				'@timestamp': '2024-08-28T17:17:44.022Z',
				data_stream: {
					namespace: 'default',
					type: 'traces',
					dataset: 'apm'
				},
				service: {
					node: {
						name: '2024/08/28/[$LATEST]634371f4aef54de6b027ffba3111013a'
					},
					environment: 'development',
					framework: {
						name: 'AWS Lambda'
					},
					name: 'FloraVisionCloudStack-SensorDataProcessor2B2527C2-J9n7oWuGMSNJ',
					runtime: {
						name: 'AWS_Lambda_nodejs18.x',
						version: '18.20.4'
					},
					language: {
						name: 'javascript'
					},
					version: '$LATEST',
					target: {
						name: 'dynamodb.us-east-1.amazonaws.com:443',
						type: 'http'
					}
				},
				host: {
					hostname: '169.254.83.157',
					os: {
						platform: 'linux'
					},
					ip: ['34.226.192.237'],
					name: '169.254.83.157',
					architecture: 'x64'
				},
				http: {
					request: {
						method: 'POST'
					},
					response: {
						status_code: 200
					}
				},
				event: {
					agent_id_status: 'missing',
					ingested: '2024-08-28T17:17:45Z',
					success_count: 1,
					outcome: 'success'
				},
				transaction: {
					id: 'e7af356a90fd2029'
				},
				span: {
					duration: {
						us: 20228
					},
					representative_count: 1,
					subtype: 'http',
					destination: {
						service: {
							resource: 'dynamodb.us-east-1.amazonaws.com:443'
						}
					},
					name: 'POST dynamodb.us-east-1.amazonaws.com',
					action: 'POST',
					id: '04f65ad240dfe578',
					type: 'external',
					sync: false
				},
				timestamp: {
					us: 1724865464022691
				}
			}
		]
	};

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
			let integrations = await ElasticIntegrationModel.find({}).select(['credentials', 'name', 'version', 'provider', 'region']);
			console.log(integrations);
			return integrations;
		} catch (error) {
			throw error;
		}
	}

	async getMetrics(credentials: any, serviceName: string): Promise<any> {
		try {
			console.log('CREDENTIALS: ', credentials);
			const client = new Client(credentials);

			//ds-traces-apm-default-2024.08.05-000012
			const res = await client.search({
				// index: '.ds-traces-apm-default-*',
				index: '*',
				body: {
					query: {
						bool: {
							must: [
								{
									range: {
										'@timestamp': {
											gte: 'now-1y/d', // Adjust the time range as needed
											lte: 'now'
										}
									}
								}
							]
						}
					},
					size: 1000, // Adjust size based on expected results
					sort: [{ '@timestamp': { order: 'desc' } }]
				}
			});

			const response = await client.search({
				index: '.ds-metrics-apm.internal-default-*',
				body: {
					query: {
						bool: {
							must: [
								{ match: { 'service.name': serviceName } }, // Directly filter by service name
								{
									range: {
										'@timestamp': {
											gte: 'now-1y/d', // Adjust the time range as needed
											lte: 'now'
										}
									}
								}
							]
						}
					},
					size: 1000, // Adjust size based on expected results
					sort: [{ '@timestamp': { order: 'desc' } }]
				}
			});

			const resp = await client.cat.indices({
				index: '*',
				v: true,
				s: 'index'
			});

			console.log('CAT INDICES: ');
			console.log(resp);

			// Process the response and retrieve the corresponed service s APM logs
			const resLogs = res.hits.hits.map((hit: any) => hit._source);
			console.log('TRACES:');
			console.log(resLogs);

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);
			console.error('apmLogs: ', apmLogs);
			const sparklineData = {
				functionDuration: apmLogs.map((log) => ({
					timestamp: log['@timestamp'],
					duration: log.faas?.duration || 0
				})),
				billedDuration: apmLogs.map((log) => ({
					timestamp: log['@timestamp'],
					billedDuration: log.faas?.billed_duration || 0
				})),
				memoryUsage: apmLogs.map((log) => ({
					timestamp: log['@timestamp'],
					freeMemory: log.system?.memory?.actual?.free || 0,
					totalMemory: log.system?.memory?.total || 0
				}))
			};
			//console.log("SPARKLINE DATA::")
			//console.log( apmLogs);
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
			console.log('RES LOGS:', resLogs);

			return {
				sparklineData,
				traces: resLogs
			};
		} catch (err: any) {
			console.error('Error occurred while running the Python script:', err);
			throw new BaseError(
				err.message || 'Error occurred while fetching logs from Elastic APM:',
				'Elastic apm  log fetchıng failed',
				500,
				'Wrong password or username'
			);
		}
	}

	async getServices(credentials: any): Promise<any> {
		try {
			const client = new Client(credentials);

			// Step 1: Use Count API to get the number of matched documents
			const countResponse: CountResponse = await client.count({
				index: '.ds-metrics-apm.internal-default-*',
				body: {
					query: {
						range: {
							'@timestamp': {
								gte: 'now-160d/d',
								lte: 'now/d'
							}
						}
					}
				}
			});

			console.log('Number of matched documents:', countResponse.count);

			// Initialize Point in Time (PIT) for consistent search results
			const pitResponse = await client.openPointInTime({
				index: '.ds-metrics-apm.internal-default-*',
				keep_alive: '1m' // Keep the PIT open for 1 minute
			});

			const pitId = pitResponse.id;

			let searchAfter = undefined;
			const allApmLogs: APMLog[] = [];
			const pageSize = 2000; // Number of results per page

			do {
				// Step 2: Use Search API with Search After and PIT
				const searchResponse: any = await client.search({
					body: {
						query: {
							range: {
								'@timestamp': {
									gte: 'now-120d/d',
									lte: 'now/d'
								}
							}
						},
						sort: [{ '@timestamp': 'asc' }], // Sort by timestamp
						search_after: searchAfter // Use the last sort value from previous results
					},
					size: pageSize,
					pit: { id: pitId } // Use an object with the PIT ID
				});

				const hits = searchResponse.hits.hits;
				if (hits.length > 0) {
					// Extract sort values for search_after
					searchAfter = hits[hits.length - 1].sort;
					const apmLogs = hits.map((hit: any) => hit._source);
					allApmLogs.push(...apmLogs);
				}
			} while (searchAfter && allApmLogs.length < countResponse.count); // Continue until no more results

			// Close the Point in Time
			await client.closePointInTime({ id: pitId });

			// Retrieve unique services
			const uniqueServicesMap = new Map<string, any>();
			allApmLogs.forEach((log: APMLog) => {
				const serviceName = log.service.name;
				if (!uniqueServicesMap.has(serviceName)) {
					uniqueServicesMap.set(serviceName, log.service);
				}
			});

			const uniqueServiceObjects = Array.from(uniqueServicesMap.values());

			return uniqueServiceObjects;
		} catch (err: any) {
			console.error('Error occurred while getting services', err);
			throw new BaseError(
				err.message || 'Error occurred while getting Services from Elastic APM:',
				'Elastic apm  getting services failed',
				500,
				'Wrong password or username'
			);
		}
	}
	async getLogs(credentials: any): Promise<any> {
		try {
			const client = new Client(credentials);

			const response = await client.search({
				index: '.ds-metrics-apm.transaction.1m-default-*'
			});

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);

			return apmLogs;
		} catch (err: any) {
			console.error('Error occurred while running the Python script:', err);
			throw new BaseError(
				err.message || 'Error occurred while fetching logs from Elastic APM:',
				'Elastic apm  log fetchıng failed',
				500,
				'Wrong password or username'
			);
		}
	}

	async getServiceLogs(credentials: any, serviceName: string): Promise<any> {
		try {
			const client = new Client(credentials);
			const lowercaseServiceName = serviceName.toLowerCase().replace(/-/g, '_');
			const index = `.ds-logs-apm.app.${lowercaseServiceName}-default-*`;
			const response = await client.search({
				index
			});

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);

			const filteredLogs = apmLogs
				.filter((log) => log.service && log.service.name === serviceName)
				.map((obj) => ({
					timestamp: obj['@timestamp'],
					message: obj.message
				}));

			return filteredLogs;
		} catch (err: any) {
			console.error('Error occurred while running the get service log:', err);
			throw new BaseError(
				err.message || 'Error occurred while fetching service logs from Elastic APM:',
				'Elastic apm  log fetchıng failed',
				500,
				'Wrong password or username'
			);
		}
	}
	async getServiceTransactions(credentials: any, serviceName: string): Promise<any> {
		try {
			const client = new Client(credentials);

			const response = await client.search({
				index: '.ds-traces-apm-default-*', // adjust the index if necessary
				body: {
					query: {
						bool: {
							must: [{ match: { 'service.name': serviceName } }]
						}
					}
				}
			});

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);

			/*  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName).map(obj => ({
		timestamp: obj['@timestamp'],
		message: obj.message
	  }));
	  */

			return apmLogs;
		} catch (err: any) {
			console.error('Error occurred while running the get service log:', err);
			throw new BaseError(
				err.message || 'Error occurred while fetching service logs from Elastic APM:',
				'Elastic apm  log fetchıng failed',
				500,
				'Wrong password or username'
			);
		}
	}
	async getElasticMapData(credentials: any): Promise<any> {
		const client = new Client(credentials);
		//
	}
	// it takes trace data for spans from elasticsearch
	async getTraceSpans(credentials: any, serviceName: string): Promise<any> {
		try {
			const client = new Client(credentials);

			// TODO:: Do this fetching traces stuff from Elasticsearch
			// const res = await client.search({
			// 	index: '*', // TODO:: Find this search index
			// 	body: {
			// 		query: {
			// 			bool: {
			// 				must: [
			// 					{
			// 						range: {
			// 							'@timestamp': {
			// 								gte: 'now-1y/d',
			// 								lte: 'now'
			// 							}
			// 						}
			// 					}
			// 				]
			// 			}
			// 		},
			// 		size: 50000,
			// 		sort: [{ '@timestamp': { order: 'desc' } }]
			// 	}
			// });

			// const traceSpans = res.hits.hits.map((hit) => hit._source);
			const traceSpans = this.trackSpanMockData.traces;

			return { traceSpans };
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error fetching traces:', error.message);
			}
			throw new BaseError(
				'Error occurred while fetching traces from Elastic APM:',
				'Elastic APM trace fetching failed',
				500,
				'Error fetching traces'
			);
		}
	}
	// it classifies the trace spans (classifyTraceSpans -> getTraceSpans)
	async classifyTraceSpans(credentials: any, serviceName: string): Promise<any> {
		try {
			const fetchedTraces = await this.getTraceSpans(credentials, serviceName);
			const { traceSpans } = fetchedTraces;

			if (!traceSpans || traceSpans.length === 0) {
				throw new Error('No trace spans found');
			}

			const classifiedSpans = TraceSpansClass.classifySpans(traceSpans);

			return classifiedSpans;
		} catch (error: any) {
			console.error('Error classifying traces:', error.message);
			throw new BaseError('Error classifying traces', error.message, 500, 'Failed to classify traces');
		}
	}

	async getErrors(credentials: any, serviceName: string, timeFilter: any, textFilters: any): Promise<any> {
		try {
			const client = new Client(credentials);

			const response = await client.search({
				index: '.ds-logs-apm.error-default-*'
				//.ds-traces-apm-default-2024.02.07-000001 **
				//metrics-endpoint.metadata_current_default
				//
				//.ds-metrics-apm.service_destination.1m-default-2024.02.07-000001
			});

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);

			const { traceId, spanId, textToInclude } = textFilters;
			const filtersToApply = new Map();
			if (traceId) filtersToApply.set('trace', traceId);
			if (spanId) filtersToApply.set('span', spanId);
			if (textToInclude) filtersToApply.set('message', textToInclude);

			const filteredLogs = apmLogs.filter((log) => {
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
					if (key == 'span' || key == 'trace') {
						if (log[key].id !== value) {
							return false; // Log doesn't match the filter
						}
					} else {
						console.log('LOG MESSAGE: ', log.message);
						if (!log.message.includes(value)) {
							return false;
						}
					}
				}

				return true;
			});

			return filteredLogs;
			/*  const filteredLogs = apmLogs.filter(log => log.service && log.service.name === serviceName).map(obj => ({
		timestamp: obj['@timestamp'],
		message: obj.message
	  }));
	  */
			console.log('HERE IS APM LOGS: ');
			console.log(JSON.stringify(apmLogs));

			return apmLogs;
		} catch (err: any) {
			console.error('Error occurred while running the get service log:', err);
			throw new BaseError(
				err.message || 'Error occurred while fetching service logs from Elastic APM:',
				'Elastic apm  log fetchıng failed',
				500,
				'Wrong password or username'
			);
		}
	}
	async setupMl(credentials: any): Promise<any> {
		try {
			const client = new Client(credentials);

			const response = await client.search({
				index: '.ds-logs-apm.app.floravisioncloudstack_sensordataprocessor2b2527c2_j9n7owugmsnj-default-*'
			});

			const apmLogs = response.hits.hits.map((hit: any) => hit._source);

			/*	// Send POST request to the Flask API
			const apiResponse = await axios.post('http://127.0.0.1:5006/categorical_comparison', formData, {
			  headers: formData.getHeaders()
			});
		*/
			// Assuming your Flask API returns some data
			//const responseData = apiResponse.data;
			const flaskResponse = await axios.post(`${process.env.DATA_SCIENCE_API_URL}/anomaly_detection`, { data: apmLogs });

			return flaskResponse.data;
		} catch (err: any) {
			console.error('Error occurred while running the Python script:', err);
			throw new BaseError(err.message || 'Error occurred while doing anomaly detection:', 'anomaly detection failed', 500, '');
		}
	}
}
