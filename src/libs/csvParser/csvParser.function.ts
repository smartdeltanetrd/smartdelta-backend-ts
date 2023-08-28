import * as fs from 'fs';
import { parse } from 'csv-parse';
import { ColumnEnum, LevelDataEnum, MessageEnum, MessageParamsEnum, ServiceDataEnum } from '../../utils/enums/CSVHeaders.enum';
import { EdgePropConts } from '../../utils/constants/LogicConstants.constants';
import { CONSTANTS } from '../../utils/Constants.constant';
import { IAnalyze } from '../../utils/interfaces/ILogic/IAnalyze';
import { NodeType } from '../../utils/types/NodeType.type';
import BaseError from '../../utils/classes/BaseErrorClass';
import { Console } from 'console';
import { calculateLatency } from './utils/csvParser.latency.utils';
import { detectProtocolFromMessage } from './utils/csvParser.detectProtcol';

export function getRawData(csvPath: fs.PathLike): Promise<any[]> {
	return new Promise((resolve, reject) => {
		let data: any[] = [];
		fs.createReadStream(csvPath)
			.pipe(parse({ delimiter: ',', from_line: 1 }))
			.on('data', async function (row) {
				data.push(row);
			})
			.on('end', () => {
				resolve(data);
			})
			.on('error', (error) => {
				reject(error);
			});
	});
}

export async function processData(rawDataChunk: any[]) {
	// Only get requested columns from csv. Level should be INTERNALTRACE
	let transactionTimestamps: Map<string, { request?: number, response?: number }> = new Map();
	// To store request timestamps by transactionId
	const columnNamesRow = await extractColumnParams(rawDataChunk.shift(), ColumnEnum);

	let cleanRows: any[] = new Array();
	// let cleanDataArray: any[] = new Array;
	let analyzedAttachment = <IAnalyze>{};

	rawDataChunk.forEach((record) => {
		if (record[columnNamesRow.get(ColumnEnum.LEVEL_CELL_NAME)!].toLowerCase() === LevelDataEnum.LEVEL_INTERNAL_TRACE) {
			let parsedRow = parseLogRow(record, columnNamesRow);
			let messageString: string = record[columnNamesRow.get(ColumnEnum.MESSAGE_CELL_NAME)!].trim();
			
			let protocol = detectProtocolFromMessage(messageString);
			parsedRow.set('protocol', protocol);

			calculateLatency(parsedRow, transactionTimestamps);
		
			cleanRows.push(Object.fromEntries(parsedRow));
		}
	});
	analyzedAttachment = extractServiceDiagram(cleanRows);

	return analyzedAttachment;
}
function extractColumnParams(parameterArray: any, columnEnums: any): Promise<Map<string, number>> {
	return new Promise((resolve, reject) => {
		const columnEnumValues = Object.values(columnEnums);

		const parameterMap = new Map<string, number>();

		parameterArray.forEach((element: any, index: number) => {
			if (columnEnumValues.includes(element.toLowerCase())) {
				parameterMap.set(element.toLowerCase().replace('@', ''), index);
			}
		});
		if (!parameterMap.size) { // Change to parameter map size compared to csv headers const length.
			reject(new BaseError('Requested CSV Headers Cannot Found in CSV File', 'Unprocessable Content', 422, "Wrong Filetype Exception"));
		}
		resolve(parameterMap);
	});
}

function parseLogRow(record: any, columnNames: Map<string, number>) {
	try {
		//Json Formatting Message Cell
		const flattenedRowObj = new Map<string, any>();

		let messageString: string = record[columnNames.get(ColumnEnum.MESSAGE_CELL_NAME)!].trim();

		let messageStringSplitted = messageString.split(':');

		messageStringSplitted[0] = CONSTANTS.DOUBLE_COUNTES.concat(messageStringSplitted[0]).concat(CONSTANTS.DOUBLE_COUNTES);

		messageString = CONSTANTS.OPEN_CURLY_BRACKETS.concat(messageStringSplitted.join(':'))
			.trim()
			.concat(CONSTANTS.CLOSE_CURLY_BRACKETS);

		const jsonMessageString = JSON.parse(messageString);

		flattenedRowObj.set(ColumnEnum.MESSAGE_CELL_NAME, jsonMessageString[Object.keys(jsonMessageString)[0]]);
		//Json Formatting Message Cell ends

		//Extract Timestamp, Level ,
		for (let [key, value] of columnNames.entries()) {
			value === columnNames.get(ColumnEnum.MESSAGE_CELL_NAME)
				? ''
				: record[value]
					? flattenedRowObj.set(key.replace('@', ''), record[value].trim())
					: '';
		}
		delete flattenedRowObj.get('message')['authorization'];
		delete flattenedRowObj.get('message')['messageParams'].authorization;

		flatJSONObject(flattenedRowObj);
		return flattenedRowObj;
	} catch (error) {
		throw new Error('Cannot Parse Row');
	}
}
function flatJSONObject(flattenedRowObj: Map<string, any>) {
	//timestamp
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]
		? flattenedRowObj.set(
			EdgePropConts['messageRealm'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]
		)
		: '';

	//messageRealm
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]
		? flattenedRowObj.set(
			EdgePropConts['messageRealm'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_REALM]
		)
		: '';
	//version 
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.VERSION]
		? flattenedRowObj.set(
			EdgePropConts['version'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.VERSION]
		)
		: '';

	//serviceAction
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION]
		? flattenedRowObj.set(
			EdgePropConts['serviceAction'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_ACTION]
		)
		: '';

	/* UNDER MESSAGE_PARAMS SECTION. MIGHT ME LOOP EXCEPT STATUS-CODE*/
	//subscriber
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.SUBSCRIBER]
		? flattenedRowObj.set(
			EdgePropConts['subscriber'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.SUBSCRIBER]
		)
		: '';

	//calledMessageQueue
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CALLED_MESSAGE_QUEUE]
		? flattenedRowObj.set(
			EdgePropConts['calledMessageQueue'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CALLED_MESSAGE_QUEUE]
		)
		: '';

	//type
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE]
		? flattenedRowObj.set(
			EdgePropConts['type'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TYPE]
		)
		: '';

	//messageID
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID]
		? flattenedRowObj.set(
			EdgePropConts['messageID'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID]
		)
		: '';

	//correlationID
	if (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CORRELATION_ID]) {
		flattenedRowObj.set(
			EdgePropConts['correlationID'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.CORRELATION_ID]
		);
	}

	//transactionID
	if (flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID]) {
		flattenedRowObj.set(
			EdgePropConts['transactionID'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID]
		);
	}
	//originatingMS
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS]
		? flattenedRowObj.set(
			EdgePropConts['originatingMS'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.ORIGINATING_MS]
		)
		: '';

	//terminatingMS
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS]
		? flattenedRowObj.set(
			EdgePropConts['terminatingMS'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TERMINATING_MS]
		)
		: '';

	//statusCode
	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.STATUS_CODE] ||
		(flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS] &&
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS][
			ServiceDataEnum.STATUS_CODE
			])
		? flattenedRowObj.set(
			EdgePropConts['statusCode'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.STATUS_CODE] ||
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.SERVICE_DATA][ServiceDataEnum.HTTP_PARAMS][
			ServiceDataEnum.STATUS_CODE
			]
		)
		: flattenedRowObj.set(EdgePropConts['statusCode'], CONSTANTS.STATIC_STATUS_CODE);

	/* UNDER MESSAGE_PARAMS SECTION. MIGHT BE LOOP EXCEPT STATUS-CODE*/

	flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID]
		? flattenedRowObj.set(
			EdgePropConts['messageIDLen'],
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.MESSAGE_ID].length
		)
		: flattenedRowObj.set(
			flattenedRowObj.get(ColumnEnum.MESSAGE_CELL_NAME)[MessageEnum.MESSAGE_PARAMS][MessageParamsEnum.TRANSACTION_ID],
			0
		);

	Object.values(ColumnEnum).forEach((item) => {
		flattenedRowObj.set(item, flattenedRowObj.get(item));
	});

	flattenedRowObj.delete(ColumnEnum.MESSAGE_CELL_NAME);
}
function extractServiceDiagram(rowArray: Array<any>): any {
	let directionArray = new Array();
	let nodeArray = new Array();

	rowArray.forEach((row) => {
		let result = directionArray.findIndex((node) => {
			return node['source'] === row[EdgePropConts['originatingMS']] && node['target'] === row[EdgePropConts['terminatingMS']];
		});

		if (result > -1) {
			// Means mapping already found. Should be updated
			directionArray[result]['count'] += 1;
			directionArray[result]['edges'].push(row);
		} else {
			//create a new one
			let newMapping = {
				source: row[EdgePropConts['originatingMS']],
				target: row[EdgePropConts['terminatingMS']],
				count: 1,
				edges: [row]
			};

			directionArray.push(newMapping);
		}

		if (!nodeArray.find((item) => item.id === row[EdgePropConts['originatingMS']])) {
			nodeArray.push(newNodeCreatorHelper(row[EdgePropConts['originatingMS']]));
		} else if (!nodeArray.find((item) => item.id === row[EdgePropConts['terminatingMS']])) {
			nodeArray.push(newNodeCreatorHelper(row[EdgePropConts['terminatingMS']]));
		}
	});

	return { directions: directionArray, nodes: nodeArray };
}

// Helpers

function newNodeCreatorHelper(node: any) {
	let nodeObj = <NodeType>{};
	nodeObj.id = node;
	nodeObj.data = {
		label: node
	};
	return nodeObj;
}
