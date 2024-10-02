const BaseClass = require('./base')
const _ = require('lodash')
const Validation = require('../validations')
const mongoose = require('mongoose');


class Booking extends BaseClass{

    constructor(ctx,next){
        super(ctx,next)
        this._beforeMethods = {
            bookRoom : ['authMiddleware'],
            cancelBooking : ['authMiddleware']
        }
    }


    async showRoomAvailability(hotelId, checkInDate, checkOutDate ){
        try{
            // const { hotelId, checkInDate, checkOutDate } = this.ctx.request.body;

            if(!mongoose.Types.ObjectId.isValid(hotelId)){
                this.throwError("201", "Invalid hotel ID")
            }

            const hotelRooms = await this.models.Room.find({hotelId})
            const conflictingBookings = await this.models.Booking.find({
                roomId: { $in: hotelRooms.map(room => room._id) },
                $or: [
                    // Check if the booking overlaps with the desired dates
                    { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
                ],
                status: { $ne: 'CANCELLED' } // Exclude cancelled bookings
            });

            const bookedRoomIds = new Set(conflictingBookings.map(booking => booking.roomId.toString()));

            // Step 4: Filter available rooms using the Set for O(1) lookup
            const availableRooms = hotelRooms.filter(room => !bookedRoomIds.has(room._id.toString()));
    
            // Return result
            // this.ctx.body =  {
            //     success: true,
            //     message: "Room availability checked successfully",
            //     data: {

            //     isAvailable: availableRooms.length > 0, // True if there are available rooms
            //     availableRooms // List of available rooms

            //     }
            // };

            return {
                isAvailable: availableRooms.length > 0, // True if there are available rooms
                availableRooms // List of available rooms
            }

            
            
        }catch(error){
            console.error('Error checking room availability:', error);
            throw new Error('Could not check room availability.');
        }
    }

    async bookRoom(){
        try{
            const { hotelId, checkInDate, checkOutDate } = this.ctx.request.body;

            if(!mongoose.Types.ObjectId.isValid(hotelId)){
                this.throwError("201", "Invalid hotel ID")
            }

            const availableRooms = await this.showRoomAvailability(hotelId, checkInDate, checkOutDate);
            if(!availableRooms.isAvailable){
                this.throwError("201", "No available rooms for the given dates")
            }

            // console.log(availableRooms)

            const booking = await this.models.Booking.create({
                userId : this.ctx.user.userId,
                hotelId,
                roomId:availableRooms.availableRooms[0]._id,
                totalCost: 5000, // Calculate total cost in dollars
                checkInDate,
                checkOutDate,
                status: 'CHECKED_IN'
            })

            this.ctx.body =  {
                success: true,
                message: "Room booked successfully",
                data: {
                    bookingId: booking._id
                }
            }

        }catch(error){
            console.error('Error booking room:', error);
            throw new Error('Could not book room.');
        }
    }

    async cancelBooking(){
        try{
            const { bookingId } = this.ctx.params;

            if(!mongoose.Types.ObjectId.isValid(bookingId)){
                this.throwError("201", "Invalid booking ID")
            }

            const booking = await this.models.Booking.findOneAndUpdate({bookingId,status:{$ne: "CANCELLED"}}, { status: 'CANCELLED' }, { new: true });

            if(!booking){
                this.throwError("201", "Booking not found or already cancelled")
            }

            this.ctx.body =  {
                success: true,
                message: "Booking cancelled successfully",
                data: {
                    bookingId
                }
            }

        }catch(error){
            console.error('Error cancelling booking:', error);
            throw new Error('Could not cancel booking.');
        }
    }
}

module.exports = Booking;