export const MLModelInputsConts: { [key: string]: string } = {
	messageRealm: 'messageRealm',
	serviceAction: 'serviceAction',
	subscriber: 'messageParams.subscriber',
	calledMessageQueue: 'messageParams.calledMessageQueue',
	type: 'messageParams.type',
	messageID: 'messageParams.messageID',
	correlationID: 'messageParams.correlationID',
	transactionID: 'messageParams.transactionID',
	originatingMS: 'messageParams.originatingMS',
	terminatingMS: 'messageParams.terminatingMS',
	statusCode: 'serviceData.httpParams.statusCode',
	messageIDLen: 'message_id_length',
	correlationIDLen: 'correlation_id_length', // Should have to be calculate
	transactionIDLen: 'transaction_id_length' // Should have to be calculate
};

export const EdgePropConts: { [key: string]: string } = {
	method: 'method',
	service: 'service',
	messageRealm: 'messageRealm',
	serviceAction: 'serviceAction',
	subscriber: 'subscriber',
	calledMessageQueue: 'calledMessageQueue',
	type: 'type',
	messageID: 'messageID',
	correlationID: 'correlationID',
	transactionID: 'transactionID',
	originatingMS: 'originatingMS',
	terminatingMS: 'terminatingMS',
	statusCode: 'statusCode',
	messageIDLen: 'messageIDLen',
	correlationIDLen: 'correlationIDLen',
	transactionIDLen: 'transactionIDLen'
};
