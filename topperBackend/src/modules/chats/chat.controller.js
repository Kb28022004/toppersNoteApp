const chatService = require('./chat.service');

exports.initializeChat = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: 'targetUserId is required' });
        }
        
        const chatData = await chatService.getOrCreateChat(req.user.id, targetUserId);
        
        res.status(200).json({
            success: true,
            message: 'Chat initialized successfully',
            data: chatData
        });
    } catch (err) {
        next(err);
    }
};

exports.notifyMessage = async (req, res, next) => {
    try {
        const { targetUserId, messageText } = req.body;
        await chatService.sendChatMessageNotification(req.user.id, targetUserId, messageText);
        res.status(200).json({ success: true, message: 'Notification sent' });
    } catch (err) {
        next(err);
    }
};

exports.getChats = async (req, res, next) => {
    try {
        const { search, limit, lastUpdatedAt, sortBy } = req.query;
        const chats = await chatService.getUserChats(req.user.id, { search, limit, lastUpdatedAt, sortBy });
        res.status(200).json({ success: true, count: chats.length, data: chats });
    } catch (err) {
        next(err);
    }
};
