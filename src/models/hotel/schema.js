const { Schema } = require("mongoose");

let schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    owner: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    address: {
      city: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
      },
      zipcode: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 10,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15,
      },
      email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100,
      },
    },
    pictures: [
        {
          type: String,
          required: true,
        },
    
    ],
    roomCounts: {
      single: { price: { type: Number }, count: { type: Number, default: 0 } }, // Count of single rooms
      premium: { price: { type: Number }, count: { type: Number, default: 0 } }, // Count of double rooms
      deluxe: { price: { type: Number }, count: { type: Number, default: 0 } }, // Count of deluxe rooms
    },
    minPrice:{ type: Number, required: true}
  },
  {
    collection: "hotels",
    timestamps: {
      createdAt: "created",
      updatedAt: "modified",
    },
    autoCreate: false,
    versionKey: false,
  }
);

module.exports = { schema };
