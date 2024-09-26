const _ = require('lodash');
const BaseClass = require('./base')

const Validation = require('../validations')


class Auth extends BaseClass{
    constructor(ctx, next) {
        super(ctx, next);
        this.arvind = "Upendra"

        this._beforeMethods = {
            //
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

    async Arvind(){
        this.ctx.body = this.arvind
    }


}

module.exports = Auth;