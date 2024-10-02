const Joi = require("joi");

const HotelRegisterSchema = Joi.object({
    name: Joi.string().trim().min(1).max(50).label("Name").required(),
    owner: Joi.string().trim().min(3).max(50).label("Owner").required(),
    address: Joi.object({
        city: Joi.string()
            .min(3)
            .max(50)
            .required(),
        
        zipcode: Joi.string()
            .min(5)
            .max(10)
            .required()
    }).required(),
    contact: Joi.object({
        phone: Joi.string()
            .min(10)
            .max(15)
            .required(),
        
        email: Joi.string()
            .email()
            .min(5)
            .max(100)
            .required()
    }).required(),
    pictures: Joi.array().items(Joi.object({
        url: Joi.string().required(),
        description: Joi.string()
    })).min(3).max(5).required()

});

module.exports = {HotelRegisterSchema}