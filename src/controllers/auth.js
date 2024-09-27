const _ = require('lodash');
const BaseClass = require('./base')
const Promise = require('bluebird')

const Validation = require('../validations')

const Authentication = require('../middlewares')
console.log(Authentication.Authentication.authMiddleware)

const authMiddleware = Authentication.Authentication.authMiddleware



class Auth extends BaseClass{
    constructor(ctx, next) {
        super(ctx, next);
        this.arvind = "Upendra"

        this._beforeMethods = {
            register : ["Arvind"],
            home : ["authMiddleware"]
        }
    }


    async authMiddleware(){
        console.log(this.ctx.request)
        const token = this.ctx.request.header?.authorization.split(' ')[1]
        console.log(token)
        if (!token) {
            this.throwError("401", "Token not provided");
        }
        // verify token


    }


    async register(){
        let {value, error} = Validation.Auth.UserRegisterSchema.validate(this.ctx.request.body);
        if (error) {
			let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
		}
        // check if user already or not
        let user = await this.models.User.findOne({email: value.email});
        if (user) {
            this.throwError("201", "User already exist");
        }
        user = new this.models.User({
            email: value.email,
            password: value.password,
            name: value.name,
            status: this.schemas.User.constants.status.active
        });

        try {
            this
            await user.save();
        } catch (error) {
            this.throwError("301")
        }

        this.ctx.body = {
            success: true,
            message: "User registered successfully",
            data: {
                user
            }
        }
    }

    // login controller
    async login(){
        let {value, error} = Validation.Auth.UserLoginSchema.validate(this.ctx.request.body);
        if (error) {
            let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
        }
        let user = await this.models.User.findOne({email: value.email});
        if (!user) {
            this.throwError("400", "User not found");
        }
        const isMatch = await user.verifyPassword(value.password);

        console.log(isMatch)

        if (!isMatch) {
            this.throwError("400", "Invalid credentials");
        }
        console.log(user)
        this.ctx.body = {
            success: true,
            message: "User logged in successfully",
            data: {
                user
            }
        }
    }

    // home controller

    async home(){

        this.ctx.body = {
            success: true,
            message: "Welcome to home",
            data: {
                user: this.ctx.user
            }
        }

    }

    async Arvind(){
        console.log("Arvind")
    }


}

module.exports = Auth;