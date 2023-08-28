export function detectProtocolFromMessage(message: any) {
	const protocols = [
		{ name: 'WebSocket', keywords: ['websocket', '"channelId":"ws'] },
		{ name: 'WebRTC', keywords: ['webrtc'] },
		{ name: 'HTTP', keywords: ['http', 'httpParams', 'externalProtocol: "http"'], verbs: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
		{ name: 'AMQP', keywords: [ '"terminatingMS":"restamqpgw"', '"originatingMS":"restamqpgw"'] }
	];

	const detectedProtocols = protocols
		.filter(protocol => protocol.keywords.some(keyword => message.includes(keyword)))
		.map(protocol => {
			if (protocol.name === 'HTTP' && protocol.verbs) {
				const foundVerb = protocol.verbs.find(verb => message.includes(verb));
				return foundVerb ? `HTTP-${foundVerb}` : protocol.name;
			}
			return protocol.name;
		});

	return detectedProtocols.length ? detectedProtocols.join(',') : 'Unknown';
}