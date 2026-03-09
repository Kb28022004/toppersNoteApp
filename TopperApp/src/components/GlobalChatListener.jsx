import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';

export const GlobalChatListener = () => {
    const { showToast } = useAlert();
    const navigation = useNavigation();
    const [currentUserId, setCurrentUserId] = useState(null);
    const isFirstSnapshot = useRef(true);

    useEffect(() => {
        const loadUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserId(user.id);
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (!currentUserId || !db) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", currentUserId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (isFirstSnapshot.current) {
                // Ignore the initial payload to prevent spamming notifications for old unread messages
                isFirstSnapshot.current = false;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const chatData = change.doc.data();
                    const lastMsg = chatData.lastMessage;

                    if (lastMsg && lastMsg.senderId !== currentUserId) {
                        // Check if we are currently looking at this chat
                        const state = navigation.getState();
                        let currentRoute = state?.routes[state.index];
                        // Dig into nested navigators if needed
                        while (currentRoute?.state) {
                            currentRoute = currentRoute.state.routes[currentRoute.state.index];
                        }

                        const isCurrentlyInThisChat =
                            currentRoute?.name === 'ChatDetails' &&
                            currentRoute?.params?.chatId === change.doc.id;

                        if (!isCurrentlyInThisChat) {
                            // Find the sender's name
                            let senderName = "New Message";
                            if (chatData.participantData && chatData.participantData[lastMsg.senderId]) {
                                senderName = chatData.participantData[lastMsg.senderId].name;
                            }

                            const messagePreview = lastMsg.type === 'image'
                                ? "Sent an image 📷"
                                : (lastMsg.type === 'doc' ? "Sent a document 📄" : lastMsg.text);

                            // Show global sliding Toast
                            showToast(
                                senderName,
                                messagePreview,
                                () => {
                                    // Make sure we navigate to the chat when tapped
                                    const otherUser = chatData.participantData[lastMsg.senderId];
                                    navigation.navigate("ChatDetails", {
                                        chatId: change.doc.id,
                                        otherUser
                                    });
                                }
                            );
                        }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [currentUserId, navigation]);

    return null; // This is a headless listener component
};
