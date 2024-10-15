class TraceSpansClass {
	static classifySpans(traces: any) {
		try {
			if (!Array.isArray(traces)) {
				throw new Error('Input data is not an array');
			}

			const spanMap: any = {};

			traces.forEach((trace) => {
				const isParentSpan = trace.processor.event === 'transaction';
				const transactionId = trace.transaction?.id || trace.trace?.id;

				// aws lambda specific fields
				const faasData = trace.faas || {};
				const isColdStart = faasData.coldstart || false;
				const executionId = faasData.execution || null;

				// parent span (transaction)
				if (isParentSpan) {
					if (!spanMap[transactionId]) {
						spanMap[transactionId] = {
							id: transactionId,
							name: trace.transaction.name || 'Unknown Transaction Name',
							duration: trace.transaction.duration?.us || 0,
							timestamp: trace['@timestamp'] || 'Unknown Timestamp',
							coldStart: isColdStart,
							faasExecution: executionId,
							outcome: trace.event?.outcome || 'Unknown Outcome',
							cloudProvider: trace.cloud?.provider || 'Unknown Cloud Provider',
							cloudServiceName: trace.cloud?.service?.name || 'Unknown Cloud Service Name',
							cloudRegion: trace.cloud?.region || 'Unknown Cloud Region',
							childSpans: [],
							type: 'parentWithoutChild' // first we assume parent has no child
						};
					} else {
						// it will be updated parent span if it already exists
						spanMap[transactionId].duration = Math.max(trace.transaction.duration?.us, spanMap[transactionId].duration);
						spanMap[transactionId].coldStart = isColdStart || spanMap[transactionId].coldStart;
						spanMap[transactionId].faasExecution = executionId || spanMap[transactionId].faasExecution;
						spanMap[transactionId].name = trace.transaction.name || spanMap[transactionId].name;
						spanMap[transactionId].outcome = trace.event?.outcome || spanMap[transactionId].outcome;
					}
				}
				// child span (non-transaction spans with parent ID)
				else if (trace.span && trace.parent && trace.parent.id) {
					const parentId = trace.parent.id;

					const childSpan = {
						id: trace.span.id,
						// name: trace.span.name || 'Unknown Span Name',
						duration: trace.span.duration?.us || 0,
						timestamp: trace['@timestamp'] || 'Unknown Timestamp',
						// action: trace.span.action || 'Unknown Action',
						outcome: trace.event?.outcome || 'Unknown Outcome',
						httpMethod: trace.http?.request?.method || 'Unknown Method',
						httpStatus: trace.http?.response?.status_code || 'Unknown Status',
						destinationServiceAddress: trace.destination?.address || 'Unknown Destination Service Address',
						destinationServicePort: trace.destination?.port || 'Unknown Destination Service Port',
						cloudProvider: trace.cloud?.provider || 'Unknown Cloud Provider',
						cloudServiceName: trace.cloud?.service?.name || 'Unknown Cloud Service Name',
						cloudRegion: trace.cloud?.region || 'Unknown Cloud Region',
						type: 'childWithParent' // a child span referencing a parent
					};

					// if the parent is a valid transaction span => child span wth parent
					if (spanMap[parentId]) {
						spanMap[parentId].childSpans.push(childSpan);
						spanMap[parentId].type = 'parentWithChild'; // reclassifies parent as having children
					} else {
						// it creates a parent placeholder if it doesn't exist, but only as a span holder (invalid parent)
						spanMap[parentId] = {
							id: parentId,
							name: 'Unknown Parent Span',
							duration: 0,
							timestamp: trace['@timestamp'] || 'Unknown Timestamp',
							coldStart: false,
							faasExecution: null,
							outcome: 'Unknown Outcome',
							cloudProvider: trace.cloud?.provider || 'Unknown Cloud Provider',
							cloudServiceName: trace.cloud?.service?.name || 'Unknown Cloud Service Name',
							cloudRegion: trace.cloud?.region || 'Unknown Cloud Region',
							childSpans: [childSpan],
							type: 'parentWithChild' // a parent placeholder with a child
						};
					}
				}
				// child spans without a parent
				else if (trace.span && !trace.parent) {
					const childSpanWithoutParent = {
						id: trace.span.id,
						duration: trace.span.duration?.us || 0,
						timestamp: trace['@timestamp'] || 'Unknown Timestamp',
						outcome: trace.event?.outcome || 'Unknown Outcome',
						httpMethod: trace.http?.request?.method || 'Unknown Method',
						httpStatus: trace.http?.response?.status_code || 'Unknown Status',
						destinationServiceAddress: trace.destination?.address || 'Unknown Destination Service Address',
						destinationServicePort: trace.destination?.port || 'Unknown Destination Service Port',
						cloudProvider: trace.cloud?.provider || 'Unknown Cloud Provider',
						cloudServiceName: trace.cloud?.service?.name || 'Unknown Cloud Service Name',
						cloudRegion: trace.cloud?.region || 'Unknown Cloud Region',
						type: 'childWithoutParent'
					};

					spanMap[trace.span.id] = childSpanWithoutParent;
				}
			});

			// parentWithChild correcter
			Object.values(spanMap).forEach((span: any) => {
				if (span.type === 'parentWithoutChild' && span.childSpans.length > 0) {
					span.type = 'parentWithChild';
				}
			});

			return spanMap;
		} catch (error: any) {
			console.error('Error classifying spans:', error.message);
			return { error: 'Failed to classify spans: ' + error.message };
		}
	}
}

export default TraceSpansClass;
