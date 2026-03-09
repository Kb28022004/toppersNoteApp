const { admin } = require('../../config/firebase');
const User = require('../users/user.model');
const TopperProfile = require('../toppers/topper.model');
const StudentProfile = require('../students/student.model');
const notificationService = require('../notifications/notification.service');

// Helper to get user profile by role
const getUserProfileData = async (userId, role) => {
    let profileData = { name: "User", profilePhoto: null };
    if (role === 'TOPPER') {
        const profile = await TopperProfile.findOne({ userId });
        if (profile) {
            profileData.name = `${profile.firstName} ${profile.lastName}`;
            profileData.profilePhoto = profile.profilePhoto || null;
        }
    } else if (role === 'STUDENT') {
        const profile = await StudentProfile.findOne({ userId });
        if (profile) {
            profileData.name = profile.fullName;
            profileData.profilePhoto = profile.profilePhoto || null;
        }
    }
    return profileData;
};

exports.getOrCreateChat = async (currentUserId, targetUserId) => {
    const db = admin.firestore();
    
    // Check if both users exist
    const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(targetUserId)
    ]);
    
    if (!currentUser || !targetUser) {
        throw new Error('User not found');
    }

    const participants = [currentUserId, targetUserId].sort();
    const chatId = participants.join('_');
    
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    
    if (!chatDoc.exists) {
        // Fetch metadata for both to store in the chat doc for easier UI rendering without multiple joins
        const [currentProfile, targetProfile] = await Promise.all([
            getUserProfileData(currentUserId, currentUser.role),
            getUserProfileData(targetUserId, targetUser.role)
        ]);

        const chatData = {
            id: chatId,
            participants,
            participantData: {
                [currentUserId]: {
                    id: currentUserId,
                    role: currentUser.role,
                    name: currentProfile.name,
                    profilePhoto: currentProfile.profilePhoto
                },
                [targetUserId]: {
                    id: targetUserId,
                    role: targetUser.role,
                    name: targetProfile.name,
                    profilePhoto: targetProfile.profilePhoto
                }
            },
            lastMessage: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await chatRef.set(chatData);
        return chatData;
    }
    
    return chatDoc.data();
};

exports.sendChatMessageNotification = async (senderId, targetUserId, messageText) => {
    try {
        const sender = await User.findById(senderId);
        const senderProfile = await getUserProfileData(senderId, sender.role);
        
        await notificationService.sendToUser(
            targetUserId,
            senderProfile.name,
            messageText,
            {
                type: 'NEW_CHAT_MESSAGE',
                metadata: { senderId }
            }
        );
    } catch (err) {
        console.error("Chat Notification Error:", err.message);
    }
};

exports.getUserChats = async (userId, { search, limit = 50, lastUpdatedAt, sortBy = 'desc' }) => {
    try {
        const db = admin.firestore();
        console.log(`Fetching chats for user: ${userId}, search: ${search}`);
        
        let query = db.collection('chats')
            .where('participants', 'array-contains', userId);

        let snapshot;
        try {
            // First attempt: use orderBy (requires index)
            let indexedQuery = query.orderBy('updatedAt', sortBy);
            
            if (lastUpdatedAt && lastUpdatedAt !== 'null' && lastUpdatedAt !== 'undefined') {
                const startAtDate = new Date(lastUpdatedAt);
                if (!isNaN(startAtDate.getTime())) {
                    indexedQuery = indexedQuery.startAfter(admin.firestore.Timestamp.fromDate(startAtDate));
                }
            }
            
            snapshot = await indexedQuery.limit(parseInt(limit)).get();
            console.log("Using indexed query");
        } catch (indexError) {
            console.warn("Index missing or query failed, falling back to in-memory sort:", indexError.message);
            // Fallback: get matches without order and sort in memory
            // This is a safety net for development
            snapshot = await query.limit(100).get(); 
        }
        
        let chatList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // In-memory sort fallback (if we didn't use indexed query or just to be safe)
        chatList.sort((a, b) => {
            const timeA = a.updatedAt?._seconds || (a.updatedAt ? new Date(a.updatedAt).getTime() / 1000 : 0);
            const timeB = b.updatedAt?._seconds || (b.updatedAt ? new Date(b.updatedAt).getTime() / 1000 : 0);
            return sortBy === 'desc' ? timeB - timeA : timeA - timeB;
        });

        // In memory search
        if (search && search.trim() !== "") {
            const searchLower = search.toLowerCase().trim();
            chatList = chatList.filter(chat => {
                const otherId = chat.participants.find(id => id !== userId);
                const otherUser = chat.participantData?.[otherId];
                return otherUser?.name?.toLowerCase().includes(searchLower);
            });
        }

        return chatList.slice(0, parseInt(limit));
    } catch (err) {
        console.error("getUserChats Main Error:", err);
        throw err;
    }
};
