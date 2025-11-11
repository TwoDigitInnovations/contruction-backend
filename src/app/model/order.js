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
            project: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
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
            total: {
                type: Number
           },
            deliveryfee: {
                type: Number
            },
            tax: {
                type: Number
            },
            expectedtime: {
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
    selectedSlot:{
      type:String
    },
    location: {
      type: pointSchema,
    },
    address: {
      type: String,
    },
    signatureimg: {
      type: String,
    },
    deliveryimg: {
      type: Array,
    },
    orderacceptbyvendor: {
      type: String,
      enum: ["yes","no"],
    },
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
      // enum:['Pending','Collected','Delivered','Packed','Driverassigned','Accepted','Rejected']
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
