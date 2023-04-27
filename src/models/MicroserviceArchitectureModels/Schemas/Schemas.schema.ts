import mongoose from 'mongoose';

export const EdgeSchema = new mongoose.Schema({
	timestamp: {
		type: String
	},
	level: {
		type: String
	},
	method: {
		type: String
	},
	service: {
		type: String
	},
	messageRealm: {
		type: String
	},
	serviceAction: {
		type: String
	},
	subscriber: {
		type: String
	},
	calledMessageQueue: {
		type: String
	},
	type: {
		type: String
	},
	messageID: {
		type: String
	},
	correlationID: {
		type: String
	},
	transactionID: {
		type: String
	},
	originatingMS: {
		type: String
	},
	terminatingMS: {
		type: String
	},
	statusCode: {
		type: String
	},
	messageIDLen: {
		type: String
	},
	correlationIDLen: {
		type: String
	},
	transactionIDLen: {
		type: String
	}
});

export const DirectionSchema = new mongoose.Schema({
	source: {
		type: String
	},
	target: {
		type: String
	},
	destination: { type: String },

	count: Number,

	edges: [EdgeSchema]
});

export const NodesSchema = new mongoose.Schema({
	id: {
		type: String
	},
	data: Object
});

export const AttachmentSchema = new mongoose.Schema({
	owner: {
		type: String,
		default: 'admin'
	},
	path: {
		type: String,
		required: true
	},
	nodes: [NodesSchema],
	directions: [DirectionSchema]
});
