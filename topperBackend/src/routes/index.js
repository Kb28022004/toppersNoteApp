const router = require('express').Router();

router.use('/auth',     require('../modules/auth/auth.routes'));
router.use('/students', require('../modules/students/student.routes'));
router.use('/toppers',  require('../modules/toppers/topper.routes'));
router.use('/admin',    require('../modules/admin/admin.routes'));
router.use('/dashboard', require('../modules/admin/admin.routes'));
router.use('/notes',    require('../modules/notes/notes.routes'));
router.use('/reviews',  require('../modules/reviews/review.routes'));
router.use('/payments', require('../modules/payments/payment.routes'));
router.use('/earnings', require('../modules/earnings/earnings.routes'));
router.use('/notifications', require('../modules/notifications/notification.routes'));
router.use('/chats', require('../modules/chats/chat.routes'));

module.exports = router;
