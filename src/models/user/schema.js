const {Schema} = require('mongoose')
const constants = require('./constants')
const address = require('./address')
const bcryptPlugin = require('mongoose-bcrypt');

let schema = new Schema({
    // _id: Schema.Types.ObjectId,
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
    address_list: {
        type: [address],
        max: 5
    },
},
    {
        collection: "users",
        timestamps: {
            createdAt: "created",
            updatedAt: "modified"
        },
        autoCreate: false,
        versionKey: false
    }
)

schema.plugin(bcryptPlugin)

module.exports = {
    schema
}