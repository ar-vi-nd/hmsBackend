const BaseClass = require('./base')
const _ = require('lodash')
const Validation = require('../validations')
const mongoose = require('mongoose');


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

        const {name,owner,address,contact,pictures,roomCounts} = value
        try{

        const addedHotel = await this.models.Hotel.create(value)

        console.log(value)

        const {roomCounts}= value


        // let totalRooms = roomCounts.single+roomCounts.double+roomCounts.deluxe

        for(let i=0;i< roomCounts.single;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:10+i,type:"single",price:1000,isBooked: false})
        }
        for(let i=0;i< roomCounts.double;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:10+i,type:"double",price:2000,isBooked: false})
        }
        for(let i=0;i< roomCounts.deluxe;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:10+i,type:"deluxe",price:3000,isBooked: false})
        }


        

        this.ctx.body = {
            success: true,
            message: "Hotel added successfully",
            data: {
               
            }
        }
    }
    catch(error){
        console.log(error)
    }
    }

    async removeHotel() {
        console.log(this.ctx.request?.params);
    
        const  hotelId  = this.ctx.request?.params?.id;

        console.log(hotelId)

        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }

        
    
        try {
            // Remove all rooms associated with the hotelId
            await this.models.Room.deleteMany({ hotelId });
    
            // Remove the hotel itself
            await this.models.Hotel.findByIdAndDelete(hotelId);
    
            this.ctx.body = {
                success: true,
                message: "Hotel and associated rooms removed successfully",
                data: {}
            };
        } catch (error) {
            console.log(error);
            this.ctx.body = {
                success: false,
                message: "Error removing hotel",
                data: { error: error.message }
            };
        }
    }
    

    async updateHotel(){
        // update hotel logic here
        

        const hotelId = this.ctx.request.params?.id
        console.log(hotelId)

        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }


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

        const { city, zipcode, limit } = this.ctx.query; // Extract query parameters

    // Build query object based on provided parameters
    let query = {};

    if (city) {
        query['address.city'] = city; // Filter by city if provided
    }

    if (zipcode) {
        query['address.zipcode'] = zipcode; // Filter by zipcode if provided
    }

    console.log(query)

    // Fetch hotels based on the query, limit the number of results if provided
    const hotels = await this.models.Hotel.find(query).limit(limit ? parseInt(limit) : 10);

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