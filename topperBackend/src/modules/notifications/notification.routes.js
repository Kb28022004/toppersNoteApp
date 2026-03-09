const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const controller = require('./notification.controller');

router.use(auth); // All notification routes require authentication

router.post('/token', controller.saveToken);
router.delete('/token', controller.removeToken);
router.get('/', controller.getNotifications);
router.patch('/read', controller.markAsRead);
router.delete('/:id', controller.deleteNotification);

module.exports = router;
