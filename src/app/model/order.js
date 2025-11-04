"use strict";

const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
});

const orderchema = new mongoose.Schema(
  {
    order_id: {
        type: String
    },

    // productDetail: [
    //     {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            productname: {
                type: String
            },
            description: {
                type: String
            },
            price: {
                type: Number
            },
            status: {
                type: String,
                default: 'Pending'
            },
    //     }
    // ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    selectedAtribute:{
      type:Object
    },
    inputvalue:{
      type:String
    },
    sheduledate:{
      type:Date
    },
    location: {
      type: pointSchema,
    },
    address: {
      type: String,
    },
    orderacceptbyvendor: {
      type: String,
      enum: ["yes","no"],
    },
    // total: {
    //     type: Number
    // },
    // address: {
    //   address: {
    //     type: String,
    //   },
    //   pincode: {
    //     type: String,
    //   },
    //   number: {
    //     type: String,
    //   },
    //   city: {
    //     type: String,
    //   },
    //   country: {
    //     type: String,
    //   },
    // },
    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

orderchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
orderchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Order", orderchema);
