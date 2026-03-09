const TopperProfile = require("../toppers/topper.model");
const AdminProfile = require("./admin.model");
const User = require("../users/user.model");
const storageService = require('../../services/storage.service');
const criteria = require("../../config/topperCriteria");
const Note = require('../notes/notes.model');
const redis = require("../../config/redis");
const StudentProfile = require("../students/student.model");
const Payout = require("../earnings/earnings.model");
const notificationService = require('../notifications/notification.service');
const Order = require("../orders/order.model");
const SystemConfig = require('./systemConfig.model');
const AuditLog = require('./auditLog.model');

const avg = (arr) => arr.reduce((sum, s) => sum + s.marks, 0) / arr.length;

const transformUrls = (item, req) => {
  if (!req) return item;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (item.marksheetUrl && item.marksheetUrl.indexOf("/uploads/") !== -1) {
    let pathAfterUploads = item.marksheetUrl.split("/uploads/")[1];
    if (!pathAfterUploads.startsWith("marksheets/")) {
      pathAfterUploads = "marksheets/" + pathAfterUploads;
    }
    item.marksheetUrl = `${baseUrl}/uploads/${pathAfterUploads}`;
  }

  if (item.profilePhoto && item.profilePhoto.indexOf("/uploads/") !== -1) {
    let pathAfterUploads = item.profilePhoto.split("/uploads/")[1];
    if (!pathAfterUploads.startsWith("profiles/")) {
      pathAfterUploads = "profiles/" + pathAfterUploads;
    }
    item.profilePhoto = `${baseUrl}/uploads/${pathAfterUploads}`;
  }
  return item;
};

// Create/Update Admin Profile
exports.createProfile = async (userId, payload, file, req) => {
    let profilePhoto;
    if (file) {
        profilePhoto = storageService.getFileUrl(req, `profiles/${file.filename}`);
    }

    const profile = await AdminProfile.findOneAndUpdate(
        { userId },
        {
            userId,
            fullName: payload.fullName,
            bio: payload.bio,
            department: payload.department,
            designation: payload.designation,
            ...(profilePhoto && { profilePhoto })
        },
        { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    return profile;
};

// Get Admin Profile
exports.getProfile = async (userId) => {
    return await AdminProfile.findOne({ userId });
};

// Get all pending topper profiles
exports.getToppers = async ({
  page = 1,
  limit = 10,
  search = "",
  expertiseClass,
  stream,
  board,
  status = "PENDING",
  req
}) => {
  // 1. Try Cache if it's a standard first page request without specific filters
  const isCacheable = page === 1 && !search && !expertiseClass && !stream && !board;
  const cacheKey = `admin:toppers:${status}`;

  if (isCacheable) {
    try {
        if (redis.status === 'ready') {
            const cached = await redis.get(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                // We still need to transform URLs because host might change (e.g. dev environment)
                parsed.data = parsed.data.map(item => transformUrls(item, req));
                return parsed;
            }
        }
    } catch (err) {
        console.error("Redis Cache Error (Get Toppers):", err.message);
    }
  }

  // Optimization: Check if any requests exist at all for this status
  const hasData = await TopperProfile.exists({ status });
  if (!hasData) {
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        pages: 0,
        limit,
      },
    };
  }

  const matchStage = { status };

  if (expertiseClass) matchStage.expertiseClass = expertiseClass;
  if (stream) matchStage.stream = stream;
  if (board) matchStage.board = board;

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (search) {
    const searchRegex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { "userDetails.phone": searchRegex },
        ],
      },
    });
  }

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            expertiseClass: 1,
            stream: 1,
            board: 1,
            subjectMarks: 1,
            marksheetUrl: 1,
            userId: {
              _id: "$userDetails._id",
              phone: "$userDetails.phone",
            },
            status: 1,
            createdAt: 1,
          },
        },
      ],
    },
  });

  const [result] = await TopperProfile.aggregate(pipeline);
  
  // Transform URLs to match current host
  const data = result.data.map((item) => transformUrls(item, req));

  const total = result.metadata[0] ? result.metadata[0].total : 0;

  const finalResult = {
    data,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };

  // Cache fixed standard requests for 5 minutes
  if (isCacheable) {
    try {
        if (redis.status === 'ready') {
            await redis.set(cacheKey, JSON.stringify(finalResult), 'EX', 300);
        }
    } catch (err) {
        console.error("Redis Cache Error (Set Toppers):", err.message);
    }
  }

  return finalResult;
};

// Approve topper

exports.approveTopper = async (profileId) => {
  const profile = await TopperProfile.findById(profileId);

  if (!profile) throw new Error("Topper profile not found");

  const { expertiseClass, stream, subjectMarks } = profile;

  // 🔹 CLASS 10 LOGIC
  if (expertiseClass === "10") {
    if (subjectMarks.length < criteria.CLASS_10.REQUIRED_SUBJECTS) {
      throw new Error("Class 10 must have 5 subjects");
    }

    const low = subjectMarks.find(
      (s) => s.marks < criteria.CLASS_10.MIN_SUBJECT_PERCENT,
    );
    if (low) {
      throw new Error(`Low marks in ${low.subject}`);
    }

    if (avg(subjectMarks) < criteria.CLASS_10.MIN_AVERAGE_PERCENT) {
      throw new Error("Average below Class 10 topper criteria");
    }
  }

  // 🔹 CLASS 12 LOGIC
  if (expertiseClass === "12") {
    const streamCriteria = criteria.CLASS_12[stream];

    if (!streamCriteria) {
      throw new Error("Invalid stream for Class 12");
    }

    // check required subjects exist
    for (const core of streamCriteria.REQUIRED_SUBJECTS) {
      const subject = subjectMarks.find((s) => s.subject === core);
      if (!subject) {
        throw new Error(`Missing core subject: ${core}`);
      }
      if (subject.marks < streamCriteria.MIN_SUBJECT_PERCENT) {
        throw new Error(`${core} marks below criteria`);
      }
    }

    if (avg(subjectMarks) < streamCriteria.MIN_AVERAGE_PERCENT) {
      throw new Error("Average below topper criteria");
    }
  }

  // ✅ APPROVE
  profile.status = "APPROVED";
  await profile.save();

  await User.findByIdAndUpdate(profile.userId, {
    isTopperVerified: true,
  });

  // 🧹 Invalidate Caches
  try {
    if (redis.status === 'ready') {
        await redis.del(`admin:toppers:PENDING`);
        await redis.del(`admin:toppers:APPROVED`);
        await redis.del('all_toppers_enriched'); // Public cache
    }
  } catch (err) {
    console.error("Redis Cache Error (Approve Topper):", err.message);
  }

  // 🔔 Send Notification
  await notificationService.sendToUser(
    profile.userId,
    "🎉 Verified Topper!",
    "Congratulations! Your profile has been verified by the admin.",
    { type: 'VERIFICATION_SUCCESS' }
  );

  return "Topper approved based on academic criteria";
};

// Reject topper

exports.rejectTopper = async (profileId, reason) => {
  const profile = await TopperProfile.findById(profileId);

  if (!profile) throw new Error("Topper profile not found");

  profile.status = "REJECTED";
  profile.adminRemark = reason || "Does not meet topper criteria";
  await profile.save();

  await User.findByIdAndUpdate(profile.userId, {
    isTopperVerified: false,
  });

  // 🧹 Invalidate Caches
  try {
    if (redis.status === 'ready') {
        await redis.del(`admin:toppers:PENDING`);
        await redis.del(`admin:toppers:REJECTED`);
    }
  } catch (err) {
    console.error("Redis Cache Error (Reject Topper):", err.message);
  }

  // 🔔 Send Notification
  await notificationService.sendToUser(
    profile.userId,
    "⚠️ Profile Update Required",
    `Your topper verification was rejected. Reason: ${reason || "Does not meet criteria"}.`,
    { type: 'VERIFICATION_REJECTED' }
  );

  return "Topper rejected";
};


// 1️⃣ Get notes by status
exports.getNotesByStatus = async ({
    status = 'UNDER_REVIEW',
    page = 1,
    limit = 10,
    search = '',
    subject = '',
    expertiseClass = '',
    board = ''
}) => {
    const skip = (page - 1) * limit;
    
    // Create match stage
    const matchStage = { status };
    if (subject) matchStage.subject = subject;
    if (expertiseClass) matchStage.class = expertiseClass;
    if (board) matchStage.board = board;

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'topperprofiles',
                localField: 'topperId',
                foreignField: 'userId',
                as: 'topperProfile'
            }
        },
        {
            $unwind: {
                path: '$topperProfile',
                preserveNullAndEmptyArrays: true
            }
        }
    ];

    if (search) {
        const searchRegex = new RegExp(search, "i");
        pipeline.push({
            $match: {
                $or: [
                    { subject: searchRegex },
                    { chapterName: searchRegex },
                    { title: searchRegex },
                    { "topperProfile.firstName": searchRegex },
                    { "topperProfile.lastName": searchRegex },
                ],
            },
        });
    }

    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        subject: 1,
                        class: 1,
                        chapterName: 1,
                        board: 1,
                        price: 1,
                        status: 1,
                        createdAt: 1,
                        topperId: {
                            _id: '$topperId',
                            firstName: '$topperProfile.firstName',
                            lastName: '$topperProfile.lastName'
                        }
                    }
                }
            ]
        }
    });

    const [result] = await Note.aggregate(pipeline);
    const total = result.metadata[0] ? result.metadata[0].total : 0;

    return {
        data: result.data,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

// 2️⃣ Approve note
exports.approveNote = async (noteId) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.status !== 'UNDER_REVIEW') {
    throw new Error('Note is not pending review');
  }

  note.status = 'PUBLISHED';
  note.adminRemark = null;
  await note.save();

  // 🔄 Increment topper stats
  await TopperProfile.updateOne(
    { userId: note.topperId },
    { $inc: { 'stats.totalNotes': 1 } }
  );

  // 🧹 Invalidate Cache
  try {
    if (redis.status === 'ready') {
        // We need to invalidate the specific status key we are fetching from
        // Assuming 'UNDER_REVIEW' is the default status for pending notes list
        await redis.del('admin:notes:under_review'); 
        await redis.del('all_toppers_enriched');
    }
  } catch (err) {
    console.error("Redis Cache Error (Approve Note):", err.message);
  }

  // 🔔 Send Notification
  await notificationService.sendToUser(
    note.topperId,
    "✅ Note Approved!",
    `Your note '${note.subject} - ${note.chapterName}' is now live on the store!`,
    { type: 'NOTE_APPROVED', metadata: { noteId: note._id } }
  );

  return 'Note approved and published';
};

// 3️⃣ Reject note
exports.rejectNote = async (noteId, reason) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  if (note.status !== 'UNDER_REVIEW') {
    throw new Error('Note is not pending review');
  }

  note.status = 'REJECTED';
  note.adminRemark = reason || 'Rejected by admin';
  await note.save();

  // 🧹 Invalidate Cache
  try {
    if (redis.status === 'ready') {
        // We need to invalidate the specific status key we are fetching from
        await redis.del('admin:notes:under_review');
    }
  } catch (err) {
    console.error("Redis Cache Error (Reject Note):", err.message);
  }

  // 🔔 Send Notification
  await notificationService.sendToUser(
    note.topperId,
    "❌ Note Rejected",
    `Your note '${note.subject}' was rejected. Reason: ${reason || 'Admin review'}.`,
    { type: 'NOTE_REJECTED', metadata: { noteId: note._id } }
  );

  return 'Note rejected';
};

// preview note (admin only)
exports.getNotePreview = async (user, noteId) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  return {
    title: note.title,
    chapterName: note.chapterName,
    subject: note.subject,
    class: note.class,
    board: note.board,
    price: note.price,
    description: note.description,
    previewImages: note.previewImages,
    pdfUrl: note.pdfUrl,
    pageCount: note.pageCount,
  };
}

exports.getDetailedUsage = async () => {
  const students = await StudentProfile.find({})
    .select('fullName class board profilePhoto stats')
    .sort({ 'stats.totalTimeSpent': -1 })
    .limit(50)
    .lean();

  const totalAppTime = students.reduce((sum, s) => sum + (s.stats?.totalTimeSpent || 0), 0);

  return {
    totalStudents: students.length,
    totalAppTime, // in seconds
    topActiveStudents: students
  };
};

// 💳 Payout Management
exports.getPayoutRequests = async ({ status = 'PENDING', page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const payouts = await Payout.find({ status })
    .populate('topperId', 'phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Payout.countDocuments({ status });

  return {
    data: payouts,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

exports.updatePayoutStatus = async (payoutId, status, transactionId, adminRemarks) => {
  const payout = await Payout.findById(payoutId);
  if (!payout) throw new Error('Payout request not found');

  if (payout.status !== 'PENDING') {
    throw new Error('Payout request is already processed');
  }

  payout.status = status;
  if (transactionId) payout.transactionId = transactionId;
  if (adminRemarks) payout.adminRemarks = adminRemarks;
  if (status === 'PAID') payout.paidAt = new Date();

  await payout.save();
  return `Payout ${status.toLowerCase()} successfully`;
};

exports.getDashboardData = async () => {
    const totalStudents = await StudentProfile.countDocuments();
    const totalToppers = await TopperProfile.countDocuments({ status: 'APPROVED' });
    const totalNotes = await Note.countDocuments({ status: 'PUBLISHED' });

    const revenueData = await Order.aggregate([
        { $match: { paymentStatus: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 📊 Note Distribution by Class
    const class10Notes = await Note.countDocuments({ class: '10', status: 'PUBLISHED' });
    const class12Notes = await Note.countDocuments({ class: '12', status: 'PUBLISHED' });

    // 📊 Top Subjects (Sample aggregation)
    const topSubjects = await Note.aggregate([
        { $match: { status: 'PUBLISHED' } },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    return {
        stats: {
            totalStudents,
            totalToppers,
            totalNotes,
            totalRevenue
        },
        charts: {
            noteDistribution: [
                { name: 'Class 10', value: class10Notes },
                { name: 'Class 12', value: class12Notes }
            ],
            topSubjects: topSubjects.map(s => ({ name: s._id, value: s.count }))
        }
    };
};

// 👥 Get all students
exports.getAllStudents = async ({ page = 1, limit = 10, search = '', class_filter = '', board = '' }) => {
    const skip = (page - 1) * limit;
    const matchStage = {};
    if (class_filter) matchStage.class = class_filter;
    if (board) matchStage.board = board;
    if (search) {
        matchStage.fullName = new RegExp(search, "i");
    }

    const students = await StudentProfile.find(matchStage)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await StudentProfile.countDocuments(matchStage);

    return {
        data: students,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

// 🛒 Get all orders/transactions
exports.getAllOrders = async ({ page = 1, limit = 10, search = '', status = '' }) => {
    const skip = (page - 1) * limit;
    const matchStage = {};
    if (status) matchStage.paymentStatus = status;

    const orders = await Order.find(matchStage)
        .populate('studentId', 'fullName')
        .populate('noteId', 'title subject')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Order.countDocuments(matchStage);

    return {
        data: orders,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

// ⚙️ System Configuration
exports.getSystemConfig = async () => {
    let config = await SystemConfig.findOne();
    if (!config) {
        config = await SystemConfig.create({});
    }
    return config;
};

exports.updateSystemConfig = async (updateData) => {
    const config = await SystemConfig.findOneAndUpdate(
        {},
        { $set: updateData },
        { new: true, upsert: true }
    );
    return config;
};

// 📢 Broadcast Notifications
exports.sendBroadcastNotification = async ({ title, body, targetRole, payload = {} }) => {
    const query = {};
    if (targetRole && targetRole !== 'ALL') {
        query.role = targetRole;
    }

    const users = await User.find(query).select('_id');
    const userIds = users.map(u => u._id);

    if (userIds.length > 0) {
        await notificationService.sendToUser(userIds, title, body, {
            type: 'SYSTEM_BROADCAST',
            ...payload
        });
    }

    return { success: true, targetCount: userIds.length };
};

// 🚫 User Moderation
exports.toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.role === 'ADMIN') throw new Error("Cannot modify admin status");

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    return {
        success: true,
        status: user.status,
        message: `User has been ${user.status.toLowerCase()}`
    };
};

// 📜 Audit Logs
exports.logAction = async ({ adminId, action, targetId, targetModel, details, ipAddress, userAgent }) => {
    try {
        await AuditLog.create({
            adminId,
            action,
            targetId,
            targetModel,
            details,
            ipAddress,
            userAgent
        });
    } catch (err) {
        console.error("❌ Audit Logging Failed:", err.message);
    }
};

exports.getAuditLogs = async ({ page = 1, limit = 20, action = '', adminId = '' }) => {
    const skip = (page - 1) * limit;
    const query = {};
    if (action) query.action = action;
    if (adminId) query.adminId = adminId;

    const logs = await AuditLog.find(query)
        .populate('adminId', 'fullName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await AuditLog.countDocuments(query);

    return {
        data: logs,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};
