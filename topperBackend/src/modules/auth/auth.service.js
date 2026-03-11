const User = require('../users/user.model');
const otpService = require('../../services/otp.service');
const jwtService = require('../../services/jwt.service');
const referralService = require('../../services/referral.service');

exports.sendOtp = async (phone, role, referralCode) => {
  let user = await User.findOne({ phone });

  // 🟢 First-time registration
  if (!user) {
    // Generate unique referral code for the new user
    const myCode = await referralService.generateUniqueCode();
    
    user = await User.create({
      phone,
      role,
      isVerified: false,
      myReferralCode: myCode
    });

    // Process referral if code was provided
    if (referralCode) {
      await referralService.handleRegistrationReferral(user._id, referralCode);
    }
  }

  // 🔴 Prevent role switching
  if (user.role !== role) {
    const err = new Error('Role mismatch for this phone number');
    err.status = 400;
    throw err;
  }

  await otpService.generateOtp(phone);

  return {
    message: 'OTP sent successfully',
  };
};

exports.verifyOtp = async (phone, otp) => {
  const isValid = await otpService.verifyOtp(phone, otp);

  if (!isValid) {
    const err = new Error('Invalid or expired OTP');
    err.status = 401;
    throw err;
  }

  const user = await User.findOne({ phone });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  user.isVerified = true;
  await user.save();

  const token = jwtService.signToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      phone: user.phone,
      role: user.role,
      profileCompleted: user.profileCompleted,
      isTopperVerified: user.isTopperVerified,
    },
  };
};
