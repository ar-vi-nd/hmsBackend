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
    };
  }

  async isAdmin() {
    if (!this.ctx.user?.isAdmin) {
      this.throwError("403");
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
      this.throwError("201", errorMessage);
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

  // TODO:

  async getAllUsers() {
    const { search, page = 1, limit = 10, sort } = this.ctx.query; // Extract query parameters

    console.log({ search, page , limit , sort })
    
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

    console.log({query, sortQuery});
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
      if (!mongoose.Types.ObjectId.isValid(userId)){
        this.throwError("201", "Invalid user ID");
      }
      const user = await this.models.User.findById(userId);
      if(!user){
        this.throwError("404", "User not found");
      }
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const updatedUser = await this.models.User.findByIdAndUpdate(
        userId,
        { $set: { status: newStatus } },
        { new: true } // Return the updated document
      );

      this.ctx.body = {
        success: true,
        message: `User status updated to ${newStatus}`,
        data: {
          updatedUser,
        },
      }


      
    } catch (error) {
      
      console.log(error)
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

  async updateBooking() {}
}

module.exports = Admin;
