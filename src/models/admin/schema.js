const { Schema } = require("mongoose");
const constants = require("./constants");

let schema = new Schema({
	// _id: new Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 50 
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	status: {
		type: String,
		required: true,
		default: constants.status.pending,
		enum: constants.status.enum
	},
	password: {
		type: String,
		required: true,
		bcrypt: true
	},
}, {
	collection: "admins",
	timestamps: {
		createdAt: "created",
		updatedAt: "modified"
	},
	autoCreate: false,
	versionKey: false
});

schema.plugin(require('mongoose-bcrypt'));

module.exports = {
	schema
};