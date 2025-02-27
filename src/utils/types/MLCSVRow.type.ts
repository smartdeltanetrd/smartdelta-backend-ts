export type MLCSVRow = {
	class?: string;
	classKeyword?: string;
	method?: string;
	device?: string;
	level?: string;
	service?: string;
	terminatingMS?: string;
	originatingMS?: string;
	calledMessageQueue?: string;
	statusCode?: string;
	destination_id?: string;
	edge_id?: string;
	messageRealm?: string;
	serviceAction?: string;
	'messageParams.subscriber'?: string;
	'messageParams.calledMessageQueue'?: string;
	'messageParams.type'?: string;
	'messageParams.messageID'?: string;
	'messageParams.correlationID'?: string;
	'messageParams.transactionID'?: string;
	'messageParams.originatingMS'?: string;
	'messageParams.terminatingMS'?: string;
	'serviceData.httpParams.statusCode'?: string;
	message_id_length?: string;
	correlation_id_length?: number;
	transaction_id_length?: number;
};
