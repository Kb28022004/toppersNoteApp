const Notification = require('./notification.model');
const User = require('../users/user.model');
const { admin, isFirebaseInitialized } = require('../../config/firebase');

/**
 * Save token for a specific user.
 * Tokens are meant to be an array of string (fcmTokens).
 */
exports.saveDeviceToken = async (userId, token) => {
    if (!token) throw new Error("Token is required");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.fcmTokens) {
        user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(token)) {
        user.fcmTokens.push(token);
        await user.save();
    }
    return { message: "Token saved successfully" };
};

/**
 * Remove token on logout
 */
exports.removeDeviceToken = async (userId, token) => {
    if (!token) return;
    
    await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: token }
    });
};

/**
 * Send Notification to User(s)
 * @param {ObjectId | Array} userIds - Target User ID(s)
 * @param {String} title - Notification title
 * @param {String} body - Notification body text
 * @param {Object} payload - { type: "NEW_SALE", metadata: { noteId: "123" } }
 */
exports.sendToUser = async (userIds, title, body, payload = {}) => {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (ids.length === 0) return;

    // 1. Save to MongoDB
    const notificationsToSave = ids.map(id => ({
        userId: id,
        title,
        body,
        type: payload.type || 'SYSTEM_ALERT',
        metadata: payload.metadata || {}
    }));

    await Notification.insertMany(notificationsToSave);

    // 2. Send via Firebase FCM
    if (!isFirebaseInitialized) {
        console.warn('⚠️ Firebase Admin not initialized: skipping FCM push.');
        return;
    }

    try {
        const users = await User.find({ _id: { $in: ids } }).select('fcmTokens');
        let allTokens = [];
        
        users.forEach(u => {
            if (u.fcmTokens && u.fcmTokens.length > 0) {
                allTokens.push(...u.fcmTokens);
            }
        });

        if (allTokens.length > 0) {
            const message = {
                notification: {
                    title,
                    body
                },
                data: {
                    type: payload.type || 'SYSTEM_ALERT',
                    metadata: JSON.stringify(payload.metadata || {})
                },
                tokens: allTokens
            };

            const response = await admin.messaging().sendMulticast(message);
            console.log(`📡 FCM Broadcast Success: ${response.successCount}, Failures: ${response.failureCount}`);
        }
    } catch (err) {
        console.error("❌ FCM Notification Error:", err.message);
    }
};

/**
 * Get Notification History
 */
exports.getUserNotifications = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const total = await Notification.countDocuments({ userId });
    
    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
        notifications,
        unreadCount,
        pagination: {
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Mark notifications as read
 */
exports.markAsRead = async (userId, notificationIds = []) => {
    const filter = { userId, isRead: false };
    if (notificationIds.length > 0) {
        filter._id = { $in: notificationIds };
    }

    await Notification.updateMany(filter, { $set: { isRead: true } });
    return { success: true };
};

/**
 * Delete a specific notification for a user
 */
exports.deleteNotification = async (userId, notificationId) => {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId });
    if (!deleted) throw new Error("Notification not found or unauthorized");
    return { success: true, message: "Notification deleted successfully" };
};
