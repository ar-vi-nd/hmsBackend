const {Schema} = require('mongoose')

const schema = new Schema({
    roomId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Room'
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    checkInDate:{
        type: Date,
        required: true
    },
    checkOutDate:{
        type: Date,
        required: true
    },
    totalCost:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: ['CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']
    }
},{
    collection: 'bookings',
    timestamps: {
        createdAt: 'created',
        updatedAt: 'modified'
    },
    autoCreate: false,
    versionKey: false
})

module.exports = {schema}