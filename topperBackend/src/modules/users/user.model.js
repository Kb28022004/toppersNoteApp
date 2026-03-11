const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },

    role: {
      type: String,
      enum: ['STUDENT', 'TOPPER', 'ADMIN'],
      required: true,
    },

    isVerified: { type: Boolean, default: false }, // OTP verified

    isTopperVerified: {
      type: Boolean,
      default: false, // ADMIN approval
    },

    profileCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED'],
      default: 'ACTIVE'
    },

    // 🏆 REFERRAL SYSTEM
    myReferralCode: { 
      type: String, 
      unique: true, 
      sparse: true, 
      uppercase: true,
      trim: true 
    },
    referredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      index: true
    },
    walletBalance: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
