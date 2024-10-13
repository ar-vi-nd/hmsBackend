const {Schema} = require('mongoose')
const constants = require('./constants')

let schema = new Schema({

    hotelId : {
        type : Schema.Types.ObjectId,
        required: true,
        ref: 'Hotel'
    },
    roomNumber: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 10
    },
    type: {
        type: String,
        required: true,
        enum: constants.type.enum
    },
    price: {
        type: Number,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
},{
        collection: "rooms",
        timestamps: {
            createdAt: "created",
            updatedAt: "modified"
        },
        autoCreate: false,
        versionKey: false
    
})

module.exports = {schema}