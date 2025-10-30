"use strict";

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    TaxRate: {
      type: Number, // 🔹 capital N
      required: true,
      default: 0,
    },
    RatePerKM: {
      type: Number, // 🔹 capital N
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
