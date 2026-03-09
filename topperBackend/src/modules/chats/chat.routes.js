const express = require('express');
const protect = require('../../middlewares/auth.middleware');
const chatController = require('./chat.controller');

const router = express.Router();

router.use(protect);

router.get('/', protect, chatController.getChats);
router.post('/init', protect, chatController.initializeChat);
router.post('/notify-message', protect, chatController.notifyMessage);

module.exports = router;
