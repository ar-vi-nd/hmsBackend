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
            home : ["authMiddleware"],
            updateProfile: ["authMiddleware"]
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
        console.log({value})
        user = new this.models.User({
            email: value.email,
            password: value.password,
            name: value.name,
            status: this.schemas.User.constants.status.active,
            phoneNo : value.phoneNo
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
			this.throwError("201", "Invalid Credentials");
        }
        console.log(value.email)
        let user = await this.models.User.findOne({email: value.email});
        console.log(user)
        if (!user) {

            this.throwError("400", "Invalid Credentials");
        }
        if(user?.status === 'inactive'){
            this.throwError("400", "Your account has been blocked")
        }

        console.log(value.password)
        const isMatch = await user.verifyPassword(value.password);

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


    async updateProfile() {

        
       try {
         let { value, error } = Validation.Auth.UserUpdateProfileSchema.validate(this.ctx.request.body);
         
         if (error) {
             let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
             this.throwError("201", errorMessage);
         }
 
         const {userId} = this.ctx.request.params
         
         // Fetch the current user
         let currentUser = await this.models.User.findById(userId);
         if (!currentUser) {
             this.throwError("404", "User not found");
         }
     
         // Check if the email is different from the current one
         if (value.email && value.email !== currentUser.email) {
             // Check if another user already has the same email
             let existingUserWithSameEmail = await this.models.User.findOne({ email: value.email });
             if (existingUserWithSameEmail) {
                 this.throwError("201", "User with the same email already exists");
             }
         }
     
         // Update the user's profile
         let updatedUser = await this.models.User.findByIdAndUpdate(
             userId,
             {
                 name: value.name || currentUser.name,  // Update name only if provided
                 phone: value.phone || currentUser.phone,  // Update phone only if provided
                 email: value.email || currentUser.email  // Update email if provided and not same
             },
             { new: true }
         );
     
         this.ctx.body = {
             success: true,
             message: "User updated successfully",
             data: {
                 user: updatedUser
             }
         };
       } catch (error) {

        console.log(error)
         this.throwError("500", "Error updating user profile");
        
       }
    }


    async logout(){
        this.ctx.cookies.set('accessToken', '', {
            httpOnly: true,
            expires: new Date(0), // Deletes the cookie
          });

        this.ctx.body = {
            success: true,
            message: "User logged out successfully"
        }
    }
    


}

module.exports = Auth;