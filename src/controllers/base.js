const _ = require('lodash');
const Utilities = require("../utilities");
const Promise = require('bluebird')
const mongoose = require('mongoose')

const JWT = require('jsonwebtoken')


const ERROR_LIST = {
	"101": {statusCode: 400, errorCode: "101", codeMsg: "API_KEY_MISSING", message: "Api Key not found in authentication header or query string"},
	"102": {statusCode: 400, errorCode: "102", codeMsg: "AUTH_FAILED", message: "Authentication required"},
	"201": {statusCode: 400, errorCode: "201", codeMsg: "DATA_VALIDATION_FAILED", message: "Invalid input data provided"},
	"301": {statusCode: 400, errorCode: "301", codeMsg: "DATA_SAVING_FAILED", message: "Data saving failed"},
	"302": {statusCode: 400, errorCode: "302", codeMsg: "DELETION_FAILED", message: "Resource deletion failed"},
	"400": {statusCode: 400, errorCode: "400", codeMsg: "ACCOUNT_DISABLED", message: "Account is disabled"},
	"403": {statusCode: 403, errorCode: "403", codeMsg: "FORBIDDEN", message: "Permission to the resource is not provided."},
	"404": {statusCode: 404, errorCode: "404", codeMsg: "NOT_FOUND", message: "Resource not found"},
	"502": {statusCode: 502, errorCode: "502", codeMsg: "BAD_GATEWAY", message: "Bad Gateway"}
};


class Base{
    constructor(ctx, next){
        this.ctx = ctx;
        this.next = next;

        this.models = Utilities.Registry.get('models')
        this.schemas = Utilities.Registry.get('schemas')
        this.env = Utilities.Registry.get('env')
        this.config = Utilities.Registry.get('config')

        this.user = null
        this.admin = null

        this._beforeMethods = {}
        this._afterMethods = {}

        this.error = null
    }
    callUpendra(){
        console.log(this["arvind"]);
        
    }
    generateAccessToken(existingUser) {

        const token = JWT.sign({userId:existingUser._id,name:existingUser.name,email:existingUser.email,status:existingUser.status,isAdmin:existingUser.isAdmin},"JWT_SECRET")
        return token;
    }

    throwError(code,message = null){
        let error = ERROR_LIST[code]
        if(!error){
            throw new Error('Internal Server Error')
        }
        if(message){
            error.message = message
        }
        this.error = error
        throw new Error(error.codeMsg)
    }


    async authMiddleware(){
        // console.log(this.ctx.request)
        const token = this.ctx.request.header?.authorization?.split(' ')[1] || this.ctx?.request?.header?.cookie?.split('=')[1]
        console.log(token)
        if (!token) {
            this.throwError("102", "Please Login First");
        }
        // verify token

       try {

        console.log("inside auth middleware just before verifying token")
         const payload = await JWT.verify(token,"JWT_SECRET")
         console.log(payload)
     
       
        this.ctx.user = payload
        // await this.next()

        console.log("After authenticationg")

    } catch (error) {
        console.log(error)
        this.throwError("102", "Invalid token");
       
      }
    }

    async isAdmin(){
        if(!this.ctx.user?.isAdmin){
            this.throwError("403","Unauthorized");
        }
    }

    // async showRoomAvailability(hotelId, checkInDate, checkOutDate ){
    //     try{
    //         // const { hotelId, checkInDate, checkOutDate } = this.ctx.request.body;

    //         if(!mongoose.Types.ObjectId.isValid(hotelId)){
    //             this.throwError("201", "Invalid hotel ID")
    //         }

    //         const hotelRooms = await this.models.Room.find({hotelId})
    //         const conflictingBookings = await this.models.Booking.find({
    //             roomId: { $in: hotelRooms.map(room => room._id) },
    //             $or: [
    //                 // Check if the booking overlaps with the desired dates
    //                 { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
    //             ],
    //             status: { $ne: 'CANCELLED' } // Exclude cancelled bookings
    //         });

    //         const bookedRoomIds = new Set(conflictingBookings.map(booking => booking.roomId.toString()));

    //         // Step 4: Filter available rooms using the Set for O(1) lookup
    //         // const availableRooms = hotelRooms.filter(room => !bookedRoomIds.has(room._id.toString()));

    //         const availableRoomsByType = hotelRooms.reduce((acc, room) => {
    //             if (!bookedRoomIds.has(room._id.toString())) {
    //                 if (!acc[room.type]) {
    //                     acc[room.type] = [];
    //                 }
    //                 acc[room.type].push(room);
    //             }
    //             return acc;
    //         }, {});
    
    //         // Return result
    //         // this.ctx.body =  {
    //         //     success: true,
    //         //     message: "Room availability checked successfully",
    //         //     data: {

    //         //     isAvailable: availableRooms.length > 0, // True if there are available rooms
    //         //     availableRooms // List of available rooms

    //         //     }
    //         // };

    //         return {
    //             // isAvailable: availableRooms.length > 0, // True if there are available rooms
    //             availableRoomsByType // List of available rooms
    //         }

            
            
    //     }catch(error){
    //         console.error('Error checking room availability:', error);
    //         throw new Error('Could not check room availability.');
    //     }
    // }

    async showRoomAvailability(hotelId, checkInDate, checkOutDate) {
        try {
            if (!mongoose.Types.ObjectId.isValid(hotelId)) {
                this.throwError("201", "Invalid hotel ID");
            }
    
            // Convert checkInDate and checkOutDate to Date objects for comparison
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
    
            // Step 1: Fetch all rooms for the given hotel
            const hotelRooms = await this.models.Room.find({ hotelId });
    
            // Step 2: Fetch conflicting bookings that overlap with the desired dates for the specific rooms in the hotel
            const conflictingBookings = await this.models.Booking.find({
                "rooms": {
                    $elemMatch: {
                        roomId: { $in: hotelRooms.map(room => room._id) },  // Match the rooms in the hotel
                        checkInDate: { $lt: checkOut },   // Use converted date to compare
                        checkOutDate: { $gt: checkIn }    // Use converted date to compare
                    }
                },
                status: { $ne: 'CANCELLED' }  // Exclude cancelled bookings
            });
    
            // Step 3: Extract booked room IDs from the conflicting bookings
            const bookedRoomIds = new Set();
            conflictingBookings.forEach(booking => {
                booking.rooms.forEach(room => {
                    const roomCheckIn = new Date(room.checkInDate);
                    const roomCheckOut = new Date(room.checkOutDate);
    
                    // Compare room's check-in and check-out dates with desired dates
                    if (roomCheckIn < checkOut && roomCheckOut > checkIn) {
                        bookedRoomIds.add(room.roomId.toString());
                    }
                });
            });
    
            // Step 4: Filter available rooms
            const availableRoomsByType = hotelRooms.reduce((acc, room) => {
                if (!bookedRoomIds.has(room._id.toString())) {
                    if (!acc[room.type]) {
                        acc[room.type] = [];
                    }
                    acc[room.type].push(room);  // Group available rooms by their type
                }
                return acc;
            }, {});
    
            // Return the available rooms grouped by type
            return {
                availableRoomsByType
            };
    
        } catch (error) {
            console.error('Error checking room availability:', error);
            throw new Error('Could not check room availability.');
        }
    }
    
    
    
    

    

    async _executeBefore(methodName) {
        if (_.size(this._beforeMethods) == 0 || !this._beforeMethods[methodName] || _.size(this._beforeMethods[methodName]) == 0) {
			return;
		}
		await Promise.each(this._beforeMethods[methodName], async(m) => {
			await this[m](this.ctx, this.next); 
		});
    }

    async _executeAfter(methodName) {
        if (_.size(this._afterMethods) == 0 || !this._afterMethods[methodName] || _.size(this._afterMethods[methodName]) == 0) {
			return;
		}
		await Promise.each(this._afterMethods[methodName], async(m) => {
			await this[m]();
		});
    }

    async execute(methodName, ...args) {
        try {
            await this._executeBefore(methodName);
            await this[methodName](...args);
            await this._executeAfter(methodName);
        } catch (error) {
            if (this.error) {
				this.ctx.status = this.error.statusCode || 400;
				this.ctx.body = {
					success: false,
					error: this.error
				};
				return;
			}
			throw error;
        }
    }
}

module.exports = Base;