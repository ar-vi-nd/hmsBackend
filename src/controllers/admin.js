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
            updateHotel : ['authMiddleware','isAdmin'],
            getAllUsers : ['authMiddleware','isAdmin'],
            login : ['authMiddleware','isAdmin']
        }
 
    }

    async isAdmin(){
        if(!this.ctx.user?.isAdmin){
            this.throwError("403")
        }
    }


    async register(){
        let {value, error} = Validation.Auth.AdminRegisterSchema.validate(this.ctx.request.body);
        if (error) {
			let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
		}
        // check if user already or not
        let admin = await this.models.Admin.findOne({email: value.email});
        if (admin) {
            this.throwError("201", "Admin already exist");
        }
        admin = new this.models.Admin({
            email: value.email,
            password: value.password,
            name: value.name,
            status: this.schemas.Admin.constants.status.active,
            isAdmin: false
        });

        try {
            this
            await admin.save();
        } catch (error) {
            this.throwError("301")
        }

        this.ctx.body = {
            success: true,
            message: "Admin registered successfully",
            data: {
                admin
            }
        }
    }



    async login(){
        let {value, error} = Validation.Auth.AdminLoginSchema.validate(this.ctx.request.body);
        if (error) {
            let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
        }

        let admin = await this.models.Admin.findOne({email:value.email});
        console.log(admin)
        if (!admin) {

            this.throwError("400", "Invalid Credentials");
        }
        const isMatch = await admin.verifyPassword(value.password)

        console.log(isMatch)

        if (!isMatch) {
            this.throwError("400", "Invalid credentials");
        }
        console.log(admin)

        const accessToken = this.generateAccessToken(admin)

        console.log(accessToken)

        this. ctx.cookies.set('accessToken', accessToken, {
            httpOnly: true, // Makes the cookie accessible only by the web server
            maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
            secure: false, // If true, only send cookie over HTTPS
            sameSite: 'lax' // Controls cross-site request behavior
          });

        this.ctx.body = {
            success: true,
            message: "Admin logged in successfully",
            data: {
                admin
            }
        }
    }

    async addHotel(){
        // add hotel logic here

        const {value,error} = Validation.Hotel.HotelRegisterSchema.validate(this.ctx.request.body)
        if (error) {
			let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
		}

        const {name,owner,address,contact,pictures} = value
        try{

        const addedHotel = await this.models.Hotel.create(value)

        console.log(value)

        const {roomCounts}= value


        // let totalRooms = roomCounts.single+roomCounts.double+roomCounts.deluxe

        for(let i=0;i< roomCounts.single.count;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:1000+i,type:"single",price:roomCounts.single.price,isBooked: false})
        }
        for(let i=0;i< roomCounts.double.count;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:100+i,type:"double",price:roomCounts.double.price,isBooked: false})
        }
        for(let i=0;i< roomCounts.deluxe.count;i++){
            await this.models.Room.create({hotelId:addedHotel._id,roomNumber:10+i,type:"deluxe",price:roomCounts.deluxe.price,isBooked: false})
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

    async getHotelsAll(){
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


    async getHotel(){
        // get hotel logic here

        const hotelId = this.ctx.request.params?.hotelId
        console.log(hotelId)

        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }

        const hotelDetails = await this.models.Hotel.findById(hotelId)
        let checkInDate = new Date(Date.now())
        let checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // One day from now

        let availableRooms = await this.showRoomAvailability(hotelId, checkInDate, checkOutDate)

        console.log(availableRooms)

        if(!hotelDetails){
            this.throwError("404", "Hotel not found")
        }

        this.ctx.body = {
            success: true,
            message: "Hotel fetched successfully",
            data: {
               hotelDetails
            }
        }
    }

    async getAllUsers(){

        const users = await this.models.User.find({})
        this.ctx.body = {
            success: true,
            message: "Users fetched successfully",
            data: {
               users
            }
        }
    }

    


}

module.exports = Admin;