import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { db, storage } from "../../config/firebase";
import AppText from "../../components/AppText";
import { Theme } from "../../theme/Theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSendChatNotificationMutation } from "../../features/api/chatApi";

const ChatDetails = ({ route, navigation }) => {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sendNotification] = useSendChatNotificationMutation();
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!chatId || !db || !currentUserId) return;

    // Listen for Messages
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      // Handle Seen Status
      const unreadMsgs = snapshot.docs.filter(
        (doc) => doc.data().senderId !== currentUserId && doc.data().status !== "seen"
      );

      if (unreadMsgs.length > 0) {
        unreadMsgs.forEach((msgDoc) => {
          updateDoc(doc(db, "chats", chatId, "messages", msgDoc.id), {
            status: "seen",
          });
        });
      }
    });

    // Listen for Typing Status
    const chatRef = doc(db, "chats", chatId);
    const unsubscribeTyping = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const typingStatus = data.typingStatus || {};
        const otherId = Object.keys(typingStatus).find((id) => id !== currentUserId);
        setIsOtherTyping(!!typingStatus[otherId]);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, currentUserId]);

  const updateTypingStatus = async (isTyping) => {
    if (!chatId || !currentUserId) return;
    const chatRef = doc(db, "chats", chatId);
    try {
      await updateDoc(chatRef, {
        [`typingStatus.${currentUserId}`]: isTyping,
      });
    } catch (e) {
      console.error("Error updating typing status", e);
    }
  };

  const handeInputChange = (text) => {
    setNewMessage(text);

    // Typing logic
    updateTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const uploadFile = async (uri, type) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `${chatId}/${Date.now()}_${uri.split('/').pop()}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handlePickMedia = async (mediaType) => {
    try {
      let result;
      if (mediaType === 'image' || mediaType === 'video') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          quality: 0.7,
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
        });
      }

      if (!result.canceled) {
        setIsUploading(true);
        const asset = result.assets[0];
        const url = await uploadFile(asset.uri, mediaType);

        const messageData = {
          text: mediaType === 'doc' ? asset.name : (mediaType === 'image' ? "Sent an image" : "Sent a video"),
          senderId: currentUserId,
          createdAt: serverTimestamp(),
          status: "sent",
          type: mediaType,
          mediaUrl: url,
        };

        await addDoc(collection(db, "chats", chatId, "messages"), messageData);
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: messageData,
          updatedAt: serverTimestamp(),
        });

        // Trigger Notification
        if (otherUser?.id) {
          sendNotification({
            targetUserId: otherUser.id,
            messageText: messageData.text
          });
        }

        setIsUploading(false);
      }
    } catch (error) {
      console.error("Media upload failed", error);
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !db) return;

    const textObj = {
      text: newMessage.trim(),
      senderId: currentUserId,
      createdAt: serverTimestamp(),
      status: "sent",
      type: "text",
    };

    setNewMessage("");
    updateTypingStatus(false);
    Keyboard.dismiss();

    try {
      // Add to messages subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), textObj);

      // Update lastMessage on chat document
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: textObj,
        updatedAt: serverTimestamp(),
      });

      // Trigger Notification
      if (otherUser?.id) {
        sendNotification({
          targetUserId: otherUser.id,
          messageText: textObj.text
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMsg = item.senderId === currentUserId;
    const time = item.createdAt
      ? new Date(item.createdAt.toDate()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "";

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMsg ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {item.type === 'image' ? (
          <TouchableOpacity onPress={() => { /* Full screen preview */ }}>
            <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : item.type === 'video' ? (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="play-circle" size={40} color="white" />
            <AppText style={styles.mediaText}>Video</AppText>
          </View>
        ) : item.type === 'doc' ? (
          <View style={styles.docRow}>
            <Ionicons name="document" size={24} color="#3B82F6" />
            <AppText style={styles.docName} numberOfLines={1}>{item.text}</AppText>
          </View>
        ) : (
          <AppText style={styles.messageText}>{item.text}</AppText>
        )}

        <View style={styles.messageFooter}>
          {time ? <AppText style={styles.timeText}>{time}</AppText> : null}
          {isMyMsg && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={item.status === 'seen' ? "#10B981" : "#94A3B8"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} weight="bold" numberOfLines={1}>
          {otherUser?.name}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={isOtherTyping ? (
          <View style={styles.typingContainer}>
            <AppText style={styles.typingText}>{otherUser?.name} is typing...</AppText>
          </View>
        ) : null}
      />

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <AppText style={styles.uploadText}>Sending file...</AppText>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn} onPress={() => handlePickMedia('image')}>
          <Ionicons name="image-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => handlePickMedia('doc')}>
          <Ionicons name="document-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          value={newMessage}
          onChangeText={handeInputChange}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.5 }]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
  },
  headerTitle: {
    fontSize: 18,
    color: "white",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 15,
  },
  listContainer: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: Theme.colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#334155",
  },
  messageText: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  timeText: {
    color: "#E2E8F0",
    fontSize: 10,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  attachBtn: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "white",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 14 : 10,
    paddingBottom: Platform.OS === "ios" ? 14 : 10,
    borderRadius: 20,
    fontSize: 15,
    minHeight: 45,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
  },
  mediaPlaceholder: {
    width: 200,
    height: 100,
    backgroundColor: "#334155",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  mediaText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    gap: 8,
  },
  docName: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingText: {
    color: "#94A3B8",
    fontSize: 12,
    fontStyle: "italic",
  },
  uploadingOverlay: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 100,
  },
  uploadText: {
    color: "white",
    fontSize: 12,
  },
});

export default ChatDetails;
