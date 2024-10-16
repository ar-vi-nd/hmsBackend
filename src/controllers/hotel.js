const BaseClass = require('./base')
const mongoose = require('mongoose')
const _ = require('lodash')
const Validation = require('../validations')
const {Cloudinary} = require("../utilities/index")




class Hotel extends BaseClass {

    constructor(ctx, next) {
        super(ctx,next)
        this._beforeMethods = {

            addHotel : ['authMiddleware','isAdmin'],
            removeHotel : ['authMiddleware','isAdmin'],
            getHotel: [],
            updateHotel : ['authMiddleware','isAdmin']
        }
        
    }


    // async getHotelsAll() {
    //     const { city, page = 1, limit = 10, sort } = this.ctx.query; // Extract query parameters
    
    //     // Build query object based on provided parameters
    //     let query = {};   
        
    //     // Use a case-insensitive regular expression for city substring match
    //     if (city && city !== "undefined") {
    //         query['address.city'] = { $regex: city, $options: 'i' }; // 'i' makes it case-insensitive
    //     }
    
    //     // Initialize the sort object
    //     let sortQuery = {};
    
    //     // Determine the sorting logic based on the 'sort' parameter
    //     if (sort === 'asc') {
    //         sortQuery['name'] = 1;  // Sort by hotel name in ascending order (case-insensitive)
    //     } else if (sort === 'desc') {
    //         sortQuery['name'] = -1; // Sort by hotel name in descending order (case-insensitive)
    //     } else if (sort === '1') {
    //         sortQuery['created'] = 1;  // Sort by creation date in ascending order
    //     } else if (sort === '-1') {
    //         sortQuery['created'] = -1; // Sort by creation date in descending order
    //     } else if (sort === '2') {
    //         sortQuery['minPrice'] = -1; // Sort by
    //     } else if (sort === '-2') {
    //         sortQuery['minPrice'] = 1; // Sort by
    //     }
    
    //     // Fetch hotels with case-insensitive sorting for 'name' field
    //     const hotels = await this.models.Hotel.find(query)
    //         .collation({ locale: 'en', strength: 2 })  // Case-insensitive collation for sorting
    //         .sort(sortQuery)  
    //         .skip((page - 1) * limit)
    //         .limit(limit ? parseInt(limit) : 10);
    
    //     const totalHotels = await this.models.Hotel.countDocuments(query);
    
    //     // Send response
    //     this.ctx.body = {
    //         success: true,
    //         message: "Hotels fetched successfully",
    //         data: {
    //             hotels,
    //             totalHotels,
    //         },
    //     };
    // }

    async getHotelsAll() {
        const { city, page = 1, limit = 10, sort } = this.ctx.query; // Extract query parameters
      
        // Build query object based on provided parameters
        let query = {};
      
        if (city && city !== "undefined") {
          // Split the search term into words (e.g., "wanderer delhi" or "delhi wanderer")
          const searchTerms = city.split(" ").filter(Boolean);
      
          // Create an array of $or conditions to search for each term in both the hotel name and city
          query['$or'] = searchTerms.map(term => ({
            $or: [
              { 'name': { $regex: term, $options: 'i' } },        // Match each term in the hotel name (case-insensitive)
              { 'address.city': { $regex: term, $options: 'i' } } // Match each term in the city name (case-insensitive)
            ]
          }));
        }
      
        // Initialize the sort object
        let sortQuery = {};
      
        // Determine the sorting logic based on the 'sort' parameter
        if (sort === 'asc') {
          sortQuery['name'] = 1;  // Sort by hotel name in ascending order
        } else if (sort === 'desc') {
          sortQuery['name'] = -1; // Sort by hotel name in descending order
        } else if (sort === '1') {
          sortQuery['created'] = 1;  // Sort by creation date in ascending order
        } else if (sort === '-1') {
          sortQuery['created'] = -1; // Sort by creation date in descending order
        } else if (sort === '2') {
          sortQuery['minPrice'] = -1; // Sort by minimum price in descending order
        } else if (sort === '-2') {
          sortQuery['minPrice'] = 1;  // Sort by minimum price in ascending order
        }
      
        // Fetch hotels with case-insensitive sorting for 'name' field
        const hotels = await this.models.Hotel.find(query)
          .collation({ locale: 'en', strength: 2 })  // Case-insensitive collation for sorting
          .sort(sortQuery)
          .skip((page - 1) * limit)
          .limit(limit ? parseInt(limit) : 10);
      
        const totalHotels = await this.models.Hotel.countDocuments(query);
      
        // Send response
        this.ctx.body = {
          success: true,
          message: "Hotels fetched successfully",
          data: {
            hotels,
            totalHotels,
          },
        };
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

        // let availableRooms = await this.showRoomAvailability(hotelId, checkInDate, checkOutDate)

        // console.log(availableRooms)

        if(!hotelDetails){
            this.throwError("404", "Hotel not found")
        }

        this.ctx.body = {
            success: true,
            message: "Hotel fetched successfully",
            data: {
               hotelDetails,
            //    availableRooms
            }
        }
    }

    async checkAvailability(){

        const {hotelId, checkInDate, checkOutDate}= this.ctx.request.query
        console.log(hotelId, checkInDate, checkOutDate)
        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }
        let availableRooms = await this.showRoomAvailability(hotelId, checkInDate, checkOutDate)
        this.ctx.body = {
            success: true,
            message: "Hotel fetched successfully",
            data: {
               availableRooms
            }
        }
    }

    async addHotel(){
        // add hotel logic here

        const data = this.ctx.request.body; // Access form data
        const files = this.ctx.request.files; // Access uploaded files    
        // Parse stringified objects
        try {
            if (typeof data.address === 'string') {
                data.address = JSON.parse(data.address); // Parse address back to object
            }
            if (typeof data.contact === 'string') {
                data.contact = JSON.parse(data.contact); // Parse contact back to object
            }
            if (typeof data.roomCounts === 'string') {
                data.roomCounts = JSON.parse(data.roomCounts); // Parse roomCounts back to object
            }
        } catch (error) {
            console.log(error)
           
            this.throwError('201', 'Request body cannot be empty or undefined');

        }

        if (!data) {
            this.throwError('201', 'Request body cannot be empty or undefined');
        }

        const pictures = files.pictures

        

        const {value,error} = Validation.Hotel.HotelRegisterSchema.validate({...data,pictures})
        if (error) {
			let errorMessage = _.size(error.details) > 0 ? error.details[0].message : null;
			this.throwError("201", errorMessage);
		}
      
        const {name,owner,address,contact,roomCounts} = value

        const minPrice = roomCounts?.single?.price || roomCounts?.premium?.price || roomCounts?.deluxe?.price


        // Upload pictures to cloudinary 

        let pictureurls = []
        try {
            pictureurls = await Promise.all(
                pictures.map(async (picture) => {
                    try {
                        const result = await Cloudinary.uploadOnCloudinary(picture.filepath);
                        return result.url;
                    } catch (error) {
                        console.log(error);
                        throw error; // Stop the entire process if one upload fails
                    }
                })
            );
        } catch (error) {
            this.throwError('500', 'Error uploading pictures');
        }

        console.log(pictureurls)

        try{

        const addedHotel = await this.models.Hotel.create({name,owner,address,contact,roomCounts,pictures:pictureurls,minPrice:minPrice})
        let nextRoomNumber = 1;

        for (let i = 0; i < roomCounts.single.count; i++) {
            await this.models.Room.create({
                hotelId:addedHotel._id,
                roomNumber: nextRoomNumber++,  // Increment room number
                type: "single",
                price: roomCounts.single.price,
                isBooked: false
            });
        }

        for (let i = 0; i < roomCounts.premium.count; i++) {
            await this.models.Room.create({
                hotelId : addedHotel._id,
                roomNumber: nextRoomNumber++,  // Continue from last room number
                type: "premium",
                price: roomCounts.premium.price,
                isBooked: false
            });
        }

        for (let i = 0; i < roomCounts.deluxe.count; i++) {
            await this.models.Room.create({
                hotelId : addedHotel._id,
                roomNumber: nextRoomNumber++,  // Continue from last room number
                type: "deluxe",
                price: roomCounts.deluxe.price,
                isBooked: false
            });
        }

        // Set initial room number based on the last existing room number, or start from 1 if no rooms exist

        // for(let i=0;i< roomCounts.single.count;i++){
        //     await this.models.Room.create({hotelId:addedHotel._id,roomNumber:1000+i,type:"single",price:roomCounts.single.price,isBooked: false})
        // }
        // for(let i=0;i< roomCounts.premium.count;i++){
        //     await this.models.Room.create({hotelId:addedHotel._id,roomNumber:100+i,type:"premium",price:roomCounts.premium.price,isBooked: false})
        // }
        // for(let i=0;i< roomCounts.deluxe.count;i++){
        //     await this.models.Room.create({hotelId:addedHotel._id,roomNumber:10+i,type:"deluxe",price:roomCounts.deluxe.price,isBooked: false})
        // }


        

        this.ctx.body = {
            success: true,
            message: "Hotel added successfully",
            data: {
               addedHotel
            }
        }
    }
    catch(error){
        console.log(error)
    }
    }

    // async updateHotel(){
    //     try {

    //         const data = this.ctx.body
    //         console.log(data)

    //         this.ctx.body = {
    //             success: true,
    //             message: "Hotel updated successfully",
    //             data: {
    //             }
    //         }
            
    //     } catch (error) {
            
    //     }
    // }

    async removeHotel() {
        console.log(this.ctx.request?.params);
    
        const  hotelId  = this.ctx.request?.params?.hotelId;

        console.log(hotelId)

        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }

        
    
        try {
            // Remove all rooms associated with the hotelId
            await this.models.Room.deleteMany({ hotelId });
    
            // Remove the hotel itself
            const hotel = await this.models.Hotel.findByIdAndDelete(hotelId);
    
            this.ctx.body = {
                success: true,
                message: "Hotel and associated rooms removed successfully",
                data: {hotel}
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
        
        
        const {hotelId} = this.ctx.request.params

        const { name, owner, address, contact, roomCounts } = this.ctx.request.body;


        if(!mongoose.Types.ObjectId.isValid(hotelId)){
            this.throwError("201", "Invalid hotel ID")
        }


        const hotelDetails = await this.models.Hotel.findById(hotelId)
        if(!hotelDetails){
            this.throwError("404", "Hotel not found")
        }
   
        const newRoomCounts = {
            single:{
                count: hotelDetails.roomCounts.single.count + roomCounts?.single?.count,
                price: roomCounts.single?.price
            },
            premium:{
                count: hotelDetails.roomCounts.premium.count + roomCounts?.premium?.count,
                price: roomCounts.premium?.price
            },
            deluxe:{
                count: hotelDetails.roomCounts.deluxe.count + roomCounts?.deluxe?.count,
                price: roomCounts.deluxe?.price
            }
            
        }


    // Update hotel details
    try {
        const updatedHotel = await this.models.Hotel.updateOne(
            { _id: hotelId },
            { $set: { name, owner, address, contact, roomCounts: newRoomCounts } },
            {new: true}
        );

        // Fetch the last room number for the hotel
        let lastRoom = await this.models.Room.find({ hotelId })
            .sort({ roomNumber: -1 })
            .limit(1);
        let nextRoomNumber = lastRoom.length > 0 ? lastRoom[0].roomNumber + 1 : 1;

        // Create new rooms if needed
        if (roomCounts.single && roomCounts.single.count > 0) {
            for (let i = 0; i < roomCounts.single.count; i++) {
                await this.models.Room.create({
                    hotelId: hotelId,
                    roomNumber: nextRoomNumber++,
                    type: "single",
                    price: roomCounts.single.price,
                    isBooked: false,
                });
            }
        }

        if (roomCounts.premium && roomCounts.premium.count > 0) {
            for (let i = 0; i < roomCounts.premium.count; i++) {
                await this.models.Room.create({
                    hotelId: hotelId,
                    roomNumber: nextRoomNumber++,
                    type: "premium",
                    price: roomCounts.premium.price,
                    isBooked: false,
                });
            }
        }

        if (roomCounts.deluxe && roomCounts.deluxe.count > 0) {
            for (let i = 0; i < roomCounts.deluxe.count; i++) {
                await this.models.Room.create({
                    hotelId: hotelId,
                    roomNumber: nextRoomNumber++,
                    type: "deluxe",
                    price: roomCounts.deluxe.price,
                    isBooked: false,
                });
            }
        }

        this.ctx.body = {
            success: true,
            message: "Hotel updated successfully",
            data: { updatedHotel },
        };
    } catch (error) {
        console.log(error);
        this.throwError('500', 'Error updating hotel details');
    }
    }

    

}

module.exports = Hotel;
