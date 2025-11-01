"use strict";

const mongoose = require("mongoose");
//const { uniq, unique } = require("underscore");
const bcrypt = require("bcryptjs");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
    },
    img: {
      type: String
    },
    docimg: {
      type: String
    },
    shop_name: {
      type: String
    },
    shop_address: {
      type: String
    },
    business_license: {
      type: String
    },
    business_license_img: {
      type: String
    },
    business_license_no: {
      type: String
    },
    tax_reg_img: {
      type: String
    },
    tax_reg_no: {
      type: String
    },
    driving_licence_img: {
      type: String
    },
    driving_licence_no: {
      type: String
    },
    vehicle_doc_img: {
      type: String
    },
    vehicle_doc_no: {
      type: String
    },
    email: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ["USER", "ADMIN", "DRIVER", "VENDOR"],
      default: "USER",
    },
    verified: {
      type: String,
      enum: ["PENDING", "VERIFIED", "SUSPEND"],
      default: "PENDING",
    },
    vehiclenumber: {
      type: String,
    },
    registration: {
      type: String,
    },
    vehicleimg: {
      type: String
    },
    nationalid: {
      type: String
    },
    nationalidfront: {
      type: String
    },
    nationalidback: {
      type: String
    },
    location: {
      type: pointSchema,
    },
    current_location: {
      type: pointSchema,
    },
    address: {
      type: String,
    },
    country: {
    type: String,
  },
  shipping_address: {
      type: Object,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    }, 
    pincode: {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);
userSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
userSchema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.password);
};
userSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("User", userSchema);
