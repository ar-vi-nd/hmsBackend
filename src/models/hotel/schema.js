const {Schema} = require('mongoose')

let schema = new Schema({
    name : {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    owner: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    address:{
        city:{
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50
        },
        zipcode:{
            type: String,
            required: true,
            minlength: 5,
            maxlength: 10
        }
    },
    contact:{
        phone:{
            type: String,
            required: true,
            minlength: 10,
            maxlength: 15
        },
        email:{
            type: String,
            required: true,
            minlength: 5,
            maxlength: 100
        }
    }
})



module.exports = {schema}