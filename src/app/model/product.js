"use strict";

const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
    },
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    attributes: [
      {
        name: {
          type: String,
        },
        value: {
          type: String,
        },
        image: {
          type: String,
        },
        unit: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
