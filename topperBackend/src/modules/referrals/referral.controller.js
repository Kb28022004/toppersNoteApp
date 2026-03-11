const User = require('../users/user.model');
const Referral = require('./referral.model');

/**
 * Get current user's referral info (Code + Balance)
 */
exports.getReferralStats = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('myReferralCode walletBalance');
        
        const totalReferrals = await Referral.countDocuments({ referrerId: req.user.id });
        
        res.status(200).json({
            success: true,
            data: {
                referralCode: user.myReferralCode,
                walletBalance: user.walletBalance,
                totalReferrals
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get referral history
 */
exports.getReferralHistory = async (req, res, next) => {
    try {
        const history = await Referral.find({ referrerId: req.user.id })
            .populate('referredId', 'phone role')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        next(err);
    }
};
