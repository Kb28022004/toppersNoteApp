const adminService = require('./admin.service');

// Create Admin Profile
exports.createProfile = async (req, res, next) => {
    try {
        const result = await adminService.createProfile(
            req.user.id,
            req.body,
            req.file,
            req
        );
        res.status(201).json({
            success: true,
            message: 'Admin profile created successfully',
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// Get Admin Profile
exports.getProfile = async (req, res, next) => {
    try {
        const profile = await adminService.getProfile(req.user.id);
        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        next(err);
    }
};


// Get all pending topper profiles
exports.getPendingToppers = async (req, res, next) => {
  try {
    const { page, limit, search, expertiseClass, stream, board, status } = req.query;
    const result = await adminService.getToppers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      expertiseClass,
      stream,
      board,
      status: status || "PENDING",
      req
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

//  Approve topper

exports.approveTopper = async (req, res, next) => {
  try {
    const result = await adminService.approveTopper(req.params.id);
    
    // 📜 Log Action
    await adminService.logAction({
      adminId: req.user.id,
      action: 'APPROVE_TOPPER',
      targetId: req.params.id,
      targetModel: 'TopperProfile',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: result });
  } catch (err) {
    next(err);
  }
};

//  Reject topper

exports.rejectTopper = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await adminService.rejectTopper(req.params.id, reason);
    res.json({ success: true, message: result });
  } catch (err) {
    next(err);
  }
};


// Get all notes by status
exports.getPendingNotes = async (req, res, next) => {
  try {
    const { status, page, limit, search, subject, expertiseClass, board } = req.query;
    const result = await adminService.getNotesByStatus({
      status: status || 'UNDER_REVIEW',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      subject,
      expertiseClass,
      board
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

// Approve a note
exports.approveNote = async (req, res, next) => {
  try {
    const result = await adminService.approveNote(req.params.noteId);

    // 📜 Log Action
    await adminService.logAction({
      adminId: req.user.id,
      action: 'APPROVE_NOTE',
      targetId: req.params.noteId,
      targetModel: 'Note',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: result,
    });
  } catch (err) {
    next(err);
  }
};

// Reject a note
exports.rejectNote = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await adminService.rejectNote(
      req.params.noteId,
      reason
    );

    res.json({
      success: true,
      message: result,
    });
  } catch (err) {
    next(err);
  }
};

// preview note (admin only)
exports.previewNote = async (req, res, next) => {
  try {
    const data = await adminService.getNotePreview(
      req.user,
      req.params.noteId
    );

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Student Usage
exports.getStudentUsage = async (req, res, next) => {
  try {
    const data = await adminService.getDetailedUsage();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// 💳 Payout Management
exports.getPayoutRequests = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getPayoutRequests({
      status: status || 'PENDING',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePayoutStatus = async (req, res, next) => {
  try {
    const { status, transactionId, adminRemarks } = req.body;
    const result = await adminService.updatePayoutStatus(
      req.params.id,
      status,
      transactionId,
      adminRemarks
    );
    res.json({
      success: true,
      message: result
    });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardData = async (req, res, next) => {
    try {
        const data = await adminService.getDashboardData();
        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
};

// 👥 Get all students
exports.getAllStudents = async (req, res, next) => {
    try {
        const { page, limit, search, class_filter, board } = req.query;
        const result = await adminService.getAllStudents({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search,
            class_filter,
            board
        });
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// 🛒 Get all orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const { page, limit, search, status } = req.query;
        const result = await adminService.getAllOrders({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search,
            status
        });
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

// ⚙️ System Configuration
exports.getSystemConfig = async (req, res, next) => {
    try {
        const config = await adminService.getSystemConfig();
        res.json({
            success: true,
            data: config
        });
    } catch (err) {
        next(err);
    }
};

exports.updateSystemConfig = async (req, res, next) => {
    try {
        const config = await adminService.updateSystemConfig(req.body);

        // 📜 Log Action
        await adminService.logAction({
            adminId: req.user.id,
            action: 'UPDATE_CONFIG',
            details: req.body,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: config,
            message: "System configuration updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

// 📢 Broadcast Notifications
exports.sendBroadcastNotification = async (req, res, next) => {
    try {
        const { title, body, targetRole, payload } = req.body;
        const result = await adminService.sendBroadcastNotification({
            title,
            body,
            targetRole,
            payload
        });
        res.json({
            success: true,
            ...result,
            message: `Broadcasting to ${result.targetCount} users`
        });
    } catch (err) {
        next(err);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await adminService.toggleUserStatus(userId);

        // 📜 Log Action
        await adminService.logAction({
            adminId: req.user.id,
            action: 'TOGGLE_USER_STATUS',
            targetId: userId,
            targetModel: 'User',
            details: { newStatus: result.status },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { page, limit, action, adminId } = req.query;
        const result = await adminService.getAuditLogs({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            action,
            adminId
        });
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        next(err);
    }
};
