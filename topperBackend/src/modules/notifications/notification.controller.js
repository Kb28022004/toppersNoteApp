const notificationService = require('./notification.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

exports.saveToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        const result = await notificationService.saveDeviceToken(req.user.id, token);
        return sendSuccess(res, result.message);
    } catch (err) {
        next(err);
    }
};

exports.removeToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        await notificationService.removeDeviceToken(req.user.id, token);
        return sendSuccess(res, 'Token removed');
    } catch (err) {
        next(err);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await notificationService.getUserNotifications(req.user.id, page, limit);
        return sendSuccess(res, 'Notifications fetched', result);
    } catch (err) {
        next(err);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { notificationIds } = req.body; // optional array of IDs
        await notificationService.markAsRead(req.user.id, notificationIds || []);
        return sendSuccess(res, 'Marked as read');
    } catch (err) {
        next(err);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await notificationService.deleteNotification(req.user.id, id);
        return sendSuccess(res, result.message);
    } catch (err) {
        next(err);
    }
};
