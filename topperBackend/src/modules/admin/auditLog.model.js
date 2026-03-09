const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., 'APPROVE_TOPPER', 'REJECT_NOTE', 'UPDATE_CONFIG', 'BROADCAST_NOTIFICATION'
        required: true,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    targetModel: {
        type: String, // e.g., 'TopperProfile', 'Note', 'Order', 'User'
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed // JSON object containing changes or additional info
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
