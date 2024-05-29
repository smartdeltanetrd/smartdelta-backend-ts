import mongoose from 'mongoose';

export const ElasticIntegrationSchema = new mongoose.Schema({
	credentials: {
		cloud: {
			id: String,
		},
		auth: {
			username: String,
			password: String
			  }
	},
	name: String,
	version: String,
	provider: String,
	region: String,

	});

export const EdgeSchema = new mongoose.Schema({
	timestamp: {
		type: String
	},
	version:{
		type: String
	},
	class: {
		type: String
	},
	classKeyword: {
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
	},
	protocol: {
		type: String
	},
	latency: {
		type: String || undefined
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

export const AttachmentSchema = new mongoose.Schema(
	{
		owner: {
			type: String,
			default: 'admin'
		},
		path: {
			type: String,
			required: true
		},
		fileSize: {
			type: Number,
			required: true
		},
		fileName: {
			type: String,
			required: true
		},
		nodes: [NodesSchema],
		directions: [DirectionSchema],
		isDeleted: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

AttachmentSchema.pre('findOneAndDelete', function (this: any, next) {
	this._conditions._id = new mongoose.Types.ObjectId(this._conditions._id);
	next();
});
AttachmentSchema.pre('find', function (this: any) {
	this.where({ isDeleted: false });
});
AttachmentSchema.pre('findOne', function (this: any) {
	this.where({ isDeleted: false });
});

AttachmentSchema.pre('findOneAndUpdate', function (this: any) {
	this.where({ isDeleted: false });
});
