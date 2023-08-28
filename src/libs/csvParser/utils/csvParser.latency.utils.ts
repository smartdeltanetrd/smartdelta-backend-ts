import { EdgePropConts } from "../../../utils/constants/LogicConstants.constants";

interface Timestamps {
	request?: number;
	response?: number;
}

function assignTimestamps(transactionId: string, transactionTimestamps: Map<string, Timestamps>, type: string, timestamp: number) {
	if (!transactionTimestamps.has(transactionId)) {
		transactionTimestamps.set(transactionId, {});
	}

	const timestamps = { ...transactionTimestamps.get(transactionId) };
	timestamps[type as keyof Timestamps] = timestamp;
	return timestamps;
}

function setLatency(parsedRow: Map<string, any>, timestamps: Timestamps) {
	if (timestamps.request === undefined || timestamps.response === undefined) {
		parsedRow.set('latency', '-');
		return;
	}

	const latency = timestamps.response - timestamps.request;
	parsedRow.set('latency', latency + 'ms');
}

export function calculateLatency(parsedRow: Map<string, any>, transactionTimestamps: Map<string, any>) {
	const transactionId = parsedRow.get(EdgePropConts['transactionID']);
	const timestamp = new Date(parsedRow.get('timestamp')).getTime();
	const type = parsedRow.get(EdgePropConts['type']);

	if (type !== 'request' && type !== 'response') {
		parsedRow.set('latency', '-');
		return;
	}

	const timestamps = assignTimestamps(transactionId, transactionTimestamps, type, timestamp);
	setLatency(parsedRow, timestamps);
	transactionTimestamps.set(transactionId, timestamps);
}
