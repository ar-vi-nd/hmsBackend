const BaseClass = require('./base')
const _ = require('lodash')
const Validation = require('../validations')

class Admin extends BaseClass{
    constructor(ctx, next) {
        super(ctx,next)
        this._beforeMethods = {
            addHotel : ['authMiddleware','isAdmin'],
            removeHotel : ['authMiddleware','isAdmin'],
            getHotels : ['authMiddleware','isAdmin'],
            updateHotel : ['authMiddleware','isAdmin']
        }
 
    }

    async isAdmin(){
        if(!this.ctx.user?.isAdmin){
            this.throwError("403")
        }
    }

    async addHotel(){
        // add hotel logic here

        const {value,error} = Validation.Hotel.HotelRegisterSchema.validate(this.ctx.request.body)
        if (error) {
			let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
		}

        const addedHotel = await this.models.Hotel.create(value

        )

        console.log(value)

        

        this.ctx.body = {
            success: true,
            message: "Hotel added successfully",
            data: {
               
            }
        }
    }

    async removeHotel(){
        // remove hotel logic here

        console.log(this.ctx.request?.params)

        this.ctx.body = {
            success: true,
            message: "Hotel removed successfully",
            data: {
               
            }
        }
    }

    async updateHotel(){
        // update hotel logic here

        const hotelId = this.ctx.request.params?.id
        console.log(hotelId)


        const hotelDetails = await this.models.Hotel.findById(hotelId)
        if(!hotelDetails){
            this.throwError("404", "Hotel not found")
        }

        const {value,error} = Validation.Hotel.HotelRegisterSchema.validate(this.ctx.request.body)
        if (error) {
            let errorMessage = _.size(error.details) > 0? error.details[0].message : null;
            this.throwError("201", errorMessage);
        }
        const newHotelDetails = await this.models.Hotel.findByIdAndUpdate(hotelId,{$set:value},{new:true})

        console.log(newHotelDetails)




        this.ctx.body = {
            success: true,
            message: "Hotel updated successfully",
            data: {
               newHotelDetails
            }
        }
    }

    async getHotels(){
        // get hotels logic here

        const hotels = await this.models.Hotel.find({})

        this.ctx.body = {
            success: true,
            message: "Hotels fetched successfully",
            data: {
               hotels
            }
        }
    }

    


}

module.exports = Admin;