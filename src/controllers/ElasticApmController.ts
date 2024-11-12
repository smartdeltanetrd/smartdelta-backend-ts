import BaseError from '../utils/classes/BaseErrorClass';
import CommonClass from '../utils/classes/CommonClass';
import axios from 'axios';
import { Client } from '@elastic/elasticsearch';
import { IElasticIntegration } from '../utils/interfaces/IModels/IElastic.interface';
import ElasticIntegrationModel from '../models/UserModel/ElasticIntegrationModel';
import TraceSpansClass from '../utils/classes/TraceSpansClass';
import { trackSpanMockData } from '../utils/constants/TrackSpanMockData.constants';
import { getStartDateFromRange } from '../utils/constants/DateConverter.constants';
import { parseISO, isAfter } from 'date-fns';

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
			console.log('apmLogs: ', JSON.stringify(apmLogs));
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

			const filteredApmLogs = apmLogs.map((log) => ({
				'@timestamp': new Date(log['@timestamp']).toLocaleString(),
				system: log.system
			}));

			return {
				sparklineData,
				traces: resLogs
				// filteredApmLogs: filteredApmLogs
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
	async getTraceSpans(credentials: any, serviceName: string, dateRange: string): Promise<any> {
		try {
			const client = new Client(credentials);

			// TODO:: Do this fetching traces stuff from Elasticsearch
			// const res = await client.search({
			// 	index: '*', // TODO:: Find this search index, put here "serviceName"
			// 	body: {
			// 		query: {
			// 			bool: {
			// 				must: [
			// 					{
			// 						range: {
			// 							'@timestamp': {
			// 								gte: `${dateRange}/d`,
			// 								lte: 'now'
			// 							}
			// 						}
			// 					}
			// 				]
			// 			}
			// 		},
			// 		size: 5000,
			// 		sort: [{ '@timestamp': { order: 'desc' } }]
			// 	}
			// });

			// const traceSpans = res.hits.hits.map((hit)  => hit._source);

			// TODO:: This and its logic will be replaced with the actual data fetching from Elasticsearch
			// const traceSpans = trackSpanMockData.traces;
			// return { traceSpans };

			const traceSpans = trackSpanMockData.traces;
			const startDate = getStartDateFromRange(dateRange);

			// it filters the trace spans based on the `@timestamp` and calculates start date
			const filteredSpans = traceSpans.filter((span: any) => {
				const spanTimestamp = parseISO(span['@timestamp']);
				return isAfter(spanTimestamp, startDate);
			});

			return { traceSpans: filteredSpans ?? {} };
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
	async classifyTraceSpans(credentials: any, serviceName: string, dateRange: any): Promise<any> {
		try {
			const fetchedTraces = await this.getTraceSpans(credentials, serviceName, dateRange);
			const { traceSpans } = fetchedTraces;

			// if (!traceSpans || traceSpans.length === 0) {
			// 	throw new Error('No trace spans found');
			// }

			const classifiedSpans = TraceSpansClass.classifySpans(traceSpans); // algo

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
