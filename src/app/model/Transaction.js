'use strict';

const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema(
  {
    note: {
      type: String,
    },
    req_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['EARN', 'WITHDRAWAL'],
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved'],
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
