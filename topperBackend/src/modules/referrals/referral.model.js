const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['REGISTRATION', 'PURCHASE'],
      required: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', referralSchema);
