const BaseClass = require('./base')
const Validation = require('../validations')
const mongoose = require('mongoose');


class Booking extends BaseClass{

    constructor(ctx,next){
        super(ctx,next)
        this._beforeMethods = {
            bookRoom : ['authMiddleware'],
            cancelBooking : ['authMiddleware'],
            getHotel : ['authMiddleware'],
            getAllBookings : ['authMiddleware'],
            getBookingDetails : ['authMiddleware']
        }
    }


    async getHotelDetails(){
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
               hotelDetails,
               availableRooms
            }
        }
    }

    async bookRoom() {
        try {
            const { hotelId, roomType, checkInDate, checkOutDate } = this.ctx.request.body;
    
            if (!mongoose.Types.ObjectId.isValid(hotelId)) {
                this.throwError("201", "Invalid hotel ID");
            }
    
            // Convert checkInDate and checkOutDate to Date objects
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);

            console.log(checkIn,checkOut)
    
            if (checkIn >= checkOut) {
                this.throwError("201", "Check-out date must be after check-in date");
            }
    
            const availableRooms = await this.showRoomAvailability(hotelId, checkIn, checkOut);
    
            if (!availableRooms.availableRoomsByType[roomType]?.length) {
                this.throwError("201", "No available rooms for the given dates");
            }
    
            // Get the first available room of the selected type
            const roomToBook = availableRooms.availableRoomsByType[roomType][0];
    
            // Calculate the total number of days between check-in and check-out
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const totalDays = Math.ceil((checkOut - checkIn)/millisecondsPerDay) ;
            console.log(totalDays)
    
            // Calculate the total cost based on room price and total days
            const totalCost = roomToBook.price * totalDays;
    
            const booking = await this.models.Booking.create({
                userId: this.ctx.user.userId,
                hotelId,
                roomId: roomToBook._id,
                totalCost,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                status: 'CHECKED_IN'
            });
    
            this.ctx.body = {
                success: true,
                message: "Room booked successfully",
                data: {
                    bookingId: booking._id,
                    totalCost
                }
            };
        } catch (error) {
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

            console.log(this.ctx.user.userId)
            const booking = await this.models.Booking.findOneAndUpdate({_id:bookingId,userId:this.ctx.user.userId,status:{$ne: "CANCELLED"}}, { status: 'CANCELLED' }, { new: true });
            console.log(booking);
            

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

    async getBookingDetails(){
        try{
            const { bookingId } = this.ctx.params;

            if(!mongoose.Types.ObjectId.isValid(bookingId)){
                this.throwError("201", "Invalid booking ID")
            }

            const booking = await this.models.Booking.findById(bookingId);

            if(!booking){
                this.throwError("201", "Booking not found")
            }

            console.log(booking.userId, this.ctx.user.userId)

            if(!booking.userId.equals(this.ctx.user.userId)){
                this.throwError("403", "Unauthorized to view this booking")
            }

            this.ctx.body =  {
                success: true,
                message: "Booking fetched successfully",
                data: {
                    booking
                }
            }

        }catch(error){
            console.error('Error fetching booking details:', error);
            throw new Error('Could not fetch booking details.');
        }
    }

    async getAllBookings(){
        try{
            const bookings = await this.models.Booking.find({userId: this.ctx.user.userId});

            this.ctx.body =  {
                success: true,
                message: "Bookings fetched successfully",
                data: {
                    bookings
                }
            }

        }catch(error){
            console.error('Error fetching all bookings:', error);
            throw new Error('Could not fetch all bookings.');
        }
    }
}

module.exports = Booking;