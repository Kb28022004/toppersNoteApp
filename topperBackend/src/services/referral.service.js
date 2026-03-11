const User = require('../modules/users/user.model');
const Referral = require('../modules/referrals/referral.model');
const notificationService = require('../modules/notifications/notification.service');

const REWARDS = {
  REGISTRATION: 50, // 50 points for referrer on new user signup
  PURCHASE_PERCENT: 0.10, // 10% commission for referrer on purchases
};

/**
 * Generate a unique 8-character referral code
 */
exports.generateUniqueCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const exists = await User.exists({ myReferralCode: code });
    if (!exists) isUnique = true;
  }
  return code;
};

/**
 * Handle new registration referral
 */
exports.handleRegistrationReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;

  const referrer = await User.findOne({ myReferralCode: referralCode.toUpperCase() });
  if (!referrer) return;

  // Link referred user
  await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });

  // Credit points to referrer
  referrer.walletBalance += REWARDS.REGISTRATION;
  await referrer.save();

  // Create referral record
  await Referral.create({
    referrerId: referrer._id,
    referredId: newUserId,
    type: 'REGISTRATION',
    pointsEarned: REWARDS.REGISTRATION,
    status: 'COMPLETED'
  });

  // Notify referrer
  await notificationService.sendToUser(
    referrer._id,
    "🎁 Referral Reward!",
    `Someone just joined using your link! You've earned ${REWARDS.REGISTRATION} points.`,
    { type: 'REFERRAL_REWARD' }
  );
};

/**
 * Handle purchase-based referral reward
 */
exports.handlePurchaseReferral = async (studentId, amount, noteId, orderId) => {
  const student = await User.findById(studentId).select('referredBy');
  if (!student || !student.referredBy) return;

  const rewardAmount = Math.round(amount * REWARDS.PURCHASE_PERCENT);
  if (rewardAmount <= 0) return;

  // Credit amount to referrer
  await User.findByIdAndUpdate(student.referredBy, {
    $inc: { walletBalance: rewardAmount }
  });

  // Create referral record
  await Referral.create({
    referrerId: student.referredBy,
    referredId: studentId,
    type: 'PURCHASE',
    pointsEarned: rewardAmount,
    status: 'COMPLETED',
    metadata: {
      orderId,
      noteId
    }
  });

  // Notify referrer
  await notificationService.sendToUser(
    student.referredBy,
    "💰 Passive Income Alert!",
    `Your referral just bought something! You've received ${rewardAmount} points in your wallet.`,
    { type: 'REFERRAL_PURCHASE_REWARD' }
  );
};
