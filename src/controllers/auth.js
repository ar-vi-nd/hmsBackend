const _ = require('lodash');
const BaseClass = require('./base')
const Promise = require('bluebird')
const JWT = require('jsonwebtoken')

const Validation = require('../validations')



function generateAccessToken(existingUser) {

    const token = JWT.sign({userId:existingUser._id,name:existingUser.name,email:existingUser.email,status:existingUser.status,isAdmin:existingUser.isAdmin},"JWT_SECRET")
    return token;


}



class Auth extends BaseClass{
    constructor(ctx, next) {
        super(ctx, next);
        this.arvind = "Upendra"

        this._beforeMethods = {
            register : ["Arvind"],
            home : ["authMiddleware"]
        }
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
        console.log(value.email)
        let user = await this.models.User.findOne({email: value.email})||await this.models.Admin.findOne({email:value.email});
        console.log(user)
        if (!user) {

            this.throwError("400", "User not found");
        }

        console.log(value.password)
        const isMatch = await user.verifyPassword(value.password)|| (user.password === value.password);

        console.log(isMatch)

        if (!isMatch) {
            this.throwError("400", "Invalid credentials");
        }
        console.log(user)

        const accessToken = generateAccessToken(user)

        console.log(accessToken)

        this.ctx.cookies.set('accessToken', accessToken, {
            httpOnly: true, // Makes the cookie accessible only by the web server
            maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
            secure: false, // If true, only send cookie over HTTPS
          });

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

        console.log("Inside home")

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