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
  KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import useTheme from "../../hooks/useTheme";
import { useMemo } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSendChatNotificationMutation } from "../../features/api/chatApi";

const ChatDetails = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [sendNotification] = useSendChatNotificationMutation();

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const insets = useSafeAreaInsets();


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

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
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
            <Ionicons name="document" size={24} color={theme.colors.primary} />
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
              color={item.status === 'seen' ? theme.colors.success : theme.colors.textMuted}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), paddingBottom: 15 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} weight="bold" numberOfLines={1}>
          {otherUser?.name}
        </AppText>
        <View style={{ width: 40 }} />
      </View>


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          style={{ flex: 1 }}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 10 }]}
          ListHeaderComponent={isOtherTyping ? (
            <View style={styles.typingContainer}>
              <AppText style={styles.typingText}>{otherUser?.name} is typing...</AppText>
            </View>
          ) : null}
          onContentSizeChange={scrollToBottom}
        />



        <View style={[
          styles.inputWrapper,
          { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 15 }
        ]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textMuted}
              value={newMessage}
              onChangeText={handeInputChange}
              multiline
              onFocus={scrollToBottom}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.5, backgroundColor: theme.colors.border }]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};



const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
    zIndex: 10,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
  },
  messageText: {
    color: theme.colors.textInverse || 'white',
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
    color: theme.colors.textMuted,
    fontSize: 10,
    opacity: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: theme.colors.card,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.border + '40',
  },
  attachBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    minHeight: 40,
    maxHeight: 120,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: theme.colors.border + '40',
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
    backgroundColor: theme.colors.border + '20',
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
    color: theme.colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },

});

export default ChatDetails;
