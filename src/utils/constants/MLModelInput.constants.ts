const MLModelInputsConts: { [key: string]: string } = {
    messageRealm: "messageRealm",
    serviceAction: "serviceAction",
    subscriber: "messageParams.subscriber",
    calledMessageQueue: "messageParams.calledMessageQueue",
    type: "messageParams.type",
    messageID: "messageParams.messageID",
    correlationID: "messageParams.correlationID",
    transactionID: "messageParams.transactionID",
    originatingMS: "messageParams.originatingMS",
    terminatingMS: "messageParams.terminatingMS",
    statusCode: "serviceData.httpParams.statusCode",
    messageIDLen: "message_id_length",
    correlationIDLen: "correlation_id_length",  // Should have to be calculate
    transactionIDLen: "transaction_id_length",  // Should have to be calculate
}

export default MLModelInputsConts