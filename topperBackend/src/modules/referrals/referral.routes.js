const router = require('express').Router();
const controller = require('./referral.controller');
const auth = require('../../middlewares/auth.middleware');

router.get('/stats', auth, controller.getReferralStats);
router.get('/history', auth, controller.getReferralHistory);

module.exports = router;
