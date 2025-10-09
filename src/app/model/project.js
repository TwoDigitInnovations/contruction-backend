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

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    projectname: {
      type: String,
    },
    location: {
      type: pointSchema,
    },
    address: {
      type: String,
    },
    startdate: {
      type: Date,
    },
    duration: {
      type: String,
    },
    billOfQuentity: {
      type: String,
    },
    // image: [{
    //   type: String,
    // }],
    // documents: [{
    //   type: String,
    // }],
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
  },
  {
    timestamps: true,
  }
);

// Add 2dsphere index for location
projectSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Project", projectSchema);