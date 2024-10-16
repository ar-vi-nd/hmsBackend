const Joi = require("joi");

const UserRegisterSchema = Joi.object({
    name: Joi.string().trim().min(1).max(50).label("Name").required(),
	password: Joi.string().trim().min(8).max(32).label("Password").required(),
	email: Joi.string().lowercase().trim().email().label("Email").required(),
    phoneNo: Joi.string().trim().min(10).max(15).label("Phone Number").required()
});

const UserLoginSchema = Joi.object({
    email: Joi.string().lowercase().trim().email().label("Email").required(),
    password: Joi.string().trim().min(8).max(32).label("Password").required(),
});

const UserUpdateProfileSchema = Joi.object({
    name: Joi.string().trim().min(1).max(50).label("Name").required(),
    email: Joi.string().lowercase().trim().email().label("Email").required(),
    phoneNo: Joi.string().trim().min(10).max(15).label("Phone Number").required(),
})

const AdminRegisterSchema = Joi.object({
    name: Joi.string().trim().min(1).max(50).label("Name").required(),
	password: Joi.string().trim().min(8).max(32).label("Password").required(),
	email: Joi.string().lowercase().trim().email().label("Email").required(),
});

const AdminLoginSchema = Joi.object({
    email: Joi.string().lowercase().trim().email().label("Email").required(),
    password: Joi.string().trim().min(8).max(32).label("Password").required(),
});

module.exports = {
    UserRegisterSchema,
    UserLoginSchema,
    UserUpdateProfileSchema,
    AdminRegisterSchema,
    AdminLoginSchema
}