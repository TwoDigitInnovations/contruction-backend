"use strict";

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    for:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    ride:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'RIDES'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
