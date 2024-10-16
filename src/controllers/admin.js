const BaseClass = require("./base");
const _ = require("lodash");
const Validation = require("../validations");
const mongoose = require("mongoose");

class Admin extends BaseClass {
  constructor(ctx, next) {
    super(ctx, next);
    this._beforeMethods = {
      addHotel: ["authMiddleware", "isAdmin"],
      removeHotel: ["authMiddleware", "isAdmin"],
      getHotels: ["authMiddleware", "isAdmin"],
      updateHotel: ["authMiddleware", "isAdmin"],
      getAllUsers: ["authMiddleware", "isAdmin"],
      login: [],
      getAllBookings: ['authMiddleware', 'isAdmin'],
      updateBooking: ['authMiddleware', 'isAdmin'],
      getAdminBookings:['authMiddleware', 'isAdmin'],
      adminDashboard : ['authMiddleware', 'isAdmin'],
      getHotelsAll:['authMiddleware', 'isAdmin'],
    };
  }

  async isAdmin() {
    if (!this.ctx.user?.isAdmin) {
      this.throwError("403", "Not a admin");
    }
  }

  async register() {
    let { value, error } = Validation.Auth.AdminRegisterSchema.validate(
      this.ctx.request.body
    );
    if (error) {
      let errorMessage =
        _.size(error.details) > 0 ? error.details[0].message : null;
      this.throwError("201", errorMessage);
    }
    // check if user already or not
    let admin = await this.models.Admin.findOne({ email: value.email });
    if (admin) {
      this.throwError("201", "Admin already exist");
    }
    admin = new this.models.Admin({
      email: value.email,
      password: value.password,
      name: value.name,
      status: this.schemas.Admin.constants.status.active,
      isAdmin: false,
    });

    try {
      this;
      await admin.save();
    } catch (error) {
      this.throwError("301");
    }

    this.ctx.body = {
      success: true,
      message: "Admin registered successfully",
      data: {
        admin,
      },
    };
  }

  async login() {
    let { value, error } = Validation.Auth.AdminLoginSchema.validate(
      this.ctx.request.body
    );
    if (error) {
      let errorMessage =
        _.size(error.details) > 0 ? error.details[0].message : null;
      this.throwError("201", "Invalid Credentials");
    }

    let admin = await this.models.Admin.findOne({ email: value.email });
    console.log(admin);
    if (!admin) {
      this.throwError("400", "Invalid Credentials");
    }
    const isMatch = await admin.verifyPassword(value.password);

    console.log(isMatch);

    if (!isMatch) {
      this.throwError("400", "Invalid credentials");
    }
    console.log(admin);

    const accessToken = this.generateAccessToken(admin);

    console.log(accessToken);

    this.ctx.cookies.set("accessToken", accessToken, {
      httpOnly: true, // Makes the cookie accessible only by the web server
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
      secure: false, // If true, only send cookie over HTTPS
    });

    this.ctx.body = {
      success: true,
      message: "Admin logged in successfully",
      data: {
        admin,
      },
    };
  }

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

  // TODO:

  async getAllUsers() {
    const { search, page = 1, limit = 10, sort } = this.ctx.query; // Extract query parameters

    console.log({ search, page, limit, sort })

    // Build query object based on provided parameters
    let query = {};

    // Use a case-insensitive regular expression for city substring match
    if (search && search !== "undefined") {
      query['name'] = { $regex: search, $options: 'i' }; // 'i' makes it case-insensitive
    }

    // Initialize the sort object
    let sortQuery = {};

    // Determine the sorting logic based on the 'sort' parameter
    if (sort === 'asc') {
      sortQuery['name'] = 1;  // Sort by hotel name in ascending order (case-insensitive)
    } else if (sort === 'desc') {
      sortQuery['name'] = -1; // Sort by hotel name in descending order (case-insensitive)
    } else if (sort === '1') {
      sortQuery['created'] = 1;  // Sort by creation date in ascending order
    } else if (sort === '-1') {
      sortQuery['created'] = -1; // Sort by creation date in descending order
    }

    console.log({ query, sortQuery });
    const users = await this.models.User.find(query)
      .collation({ locale: 'en', strength: 2 })  // Case-insensitive collation for sorting
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit ? parseInt(limit) : 10);

    const totalUsers = await this.models.User.countDocuments(query);

    this.ctx.body = {
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        totalUsers,
      },
    };
  }

  async getUserDetails() {
    const userId = this.ctx.request.params?.userId;
    console.log(userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      this.throwError("201", "Invalid user ID");
    }

    const userDetails = await this.models.User.findById(userId);

    if (!userDetails) {
      this.throwError("404", "User not found");
    }

    this.ctx.body = {
      success: true,
      message: "User fetched successfully",
      data: {
        userDetails,
      },
    };
  }

  async updateUser() {
    try {
      const userId = this.ctx.request.params?.userId;
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        this.throwError("201", "Invalid user ID");
      }
  
      const user = await this.models.User.findById(userId);
      if (!user) {
        this.throwError("404", "User not found");
      }
  
      // Find and cancel all active bookings for this user
      const cancelledBookings = await this.models.Booking.updateMany(
        { userId: userId, status: 'BOOKED' },  // Assuming 'status' represents booking status
        { $set: { status: 'CANCELLED' } }      // Mark all active bookings as 'cancelled'
      );
  
      // Toggle user status
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const updatedUser = await this.models.User.findByIdAndUpdate(
        userId,
        { $set: { status: newStatus } },
        { new: true }  // Return the updated document
      );
  
      this.ctx.body = {
        success: true,
        message: `User status updated to ${newStatus} and ${cancelledBookings.nModified} bookings cancelled`,
        data: {
          updatedUser,
          cancelledBookings
        },
      };
  
    } catch (error) {
      console.log(error);
      this.ctx.body = {
        success: false,
        message: 'Error updating user and cancelling bookings',
      };
    }
  }
  

  async getUserBookings() {
    const userId = this.ctx.request.params?.userId;
    console.log(userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      this.throwError("201", "Invalid user ID");
    }

    const userBookings = await this.models.Booking.find({ userId });

    if (!userBookings) {
      this.throwError("404", "User bookings not found");
    }

    this.ctx.body = {
      success: true,
      message: "User bookings fetched successfully",
      data: {
        userBookings,
      },
    };
  }

  async getUserBookingDetails() {
    const userId = this.ctx.request.params?.userId;
    const bookingId = this.ctx.request.params?.bookingId;
    console.log(userId, bookingId);

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      this.throwError("201", "Invalid user ID or booking ID");
    }

    const bookingDetails = await this.models.Booking.findById(
      bookingId
    ).populate("hotelId");

    if (!bookingDetails) {
      this.throwError("404", "Booking not found");
    }

    this.ctx.body = {
      success: true,
      message: "Booking fetched successfully",
      data: {
        bookingDetails,
      },
    };
  }

  async getAdminBookings() {
    try {
      const sortQuery = {};
      const { search, page = 1, limit = 10, sort } = this.ctx.query;
  
      // Apply sorting based on the provided sort parameter
      if (sort === 'asc') {
        sortQuery['hotelId'] = 1;  // Sort by hotelId in ascending order
      } else if (sort === 'desc') {
        sortQuery['hotelId'] = -1; // Sort by hotelId in descending order
      } else if (sort === '1') {
        sortQuery['created'] = 1;  // Sort by creation date in ascending order
      } else if (sort === '-1') {
        sortQuery['created'] = -1; // Sort by creation date in descending order
      }
  
      // Build the query
      const query = {};
  
      // If hotel name (search) is provided, search for the hotel's ObjectId
      if (search) {
        const hotel = await this.models.Hotel.findOne({ name: new RegExp(search, 'i') }).select('_id');
        if (hotel) {
          query['hotelId'] = hotel._id;
        } else {
          // If no hotel is found, return an empty list
          this.ctx.body = {
            success: true,
            message: "No bookings found for the specified hotel",
            data: []
          };
          return;
        }
      }
      // Fetch bookings with sorting, pagination (limit), and filter by hotel name
      const bookings = await this.models.Booking.find(query)
        .populate({
          path: 'rooms.roomId',  // Populating the Room
        })
        .populate({
          path: 'userId',  // Populating the User
          select: 'name email'  // Selecting only user name and email
        })
        .populate({
          path: 'hotelId',  // Populating the Hotel
          select: 'name address contact'  // Selecting only hotel name, address, and contact
        })
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit ? parseInt(limit) : 10);  // Default limit to 10 if not provided

        const totalBookings = await this.models.Booking.countDocuments(query);  // Count total bookings for the given query
  
      // Return the list of bookings
      this.ctx.body = {
        success: true,
        message: "Bookings fetched successfully",
        data: {bookings, totalBookings}
      };
    } catch (error) {
      console.error('Error fetching bookings for admin:', error);
      throw new Error('Could not fetch bookings.');
    }
  }
  
  async updateBooking() {
    try {
      
      const bookingId = this.ctx.request.params?.bookingId;
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        this.throwError("201", "Invalid booking ID");
      }
      const booking = await this.models.Booking.findById(bookingId);
      if (!booking) {
        this.throwError("404", "Booking not found");
      }
      const cancelledBooking = await this.models.Booking.findByIdAndUpdate(booking, {$set:{status: "CANCELLED"}},{new: true})
      if(!cancelledBooking){
        this.throwError("500", "Failed to cancel booking");
      }
      this.ctx.body = {
        success: true,
        message: "Booking cancelled successfully",
        data: {
          cancelledBooking,
        },
      }
    } catch (error) {
      console.error('Error updating bookings for admin:', error);
      throw new Error('Could not update bookings.');
    }
  }

  async adminDashboard(){
   try {
     const hotelCount = await this.models.Hotel.countDocuments();
     const bookingCount = await this.models.Booking.countDocuments();
     const userCount = await this.models.User.countDocuments();
     const activeUserCount = await this.models.User.countDocuments({status:"active"})
     const activeBookingsCount = await this.models.Booking.countDocuments({
      status: { $ne: "CANCELLED" }
    });
    
     this.ctx.body = {
       success: true,
       message: "Admin dashboard fetched successfully",
       data: {
         hotelCount,
         bookingCount,
         userCount,
         activeUserCount,
         activeBookingsCount,
       },
     };
   } catch (error) {
    throw new Error('Could not fetch dashboard data.');
   }
  }
}



module.exports = Admin;
