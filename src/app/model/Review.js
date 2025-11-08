'use strict';

const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
  rateby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rateto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  // order: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  // },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
}, { timestamps: true });


reviewSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Review', reviewSchema);