import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useGetChatsQuery } from "../../features/api/chatApi";
import SearchBar from "../../components/SearchBar";
import AppText from "../../components/AppText";
import { Theme } from "../../theme/Theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenLoader from "../../components/ScreenLoader";

const ChatList = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      }
    };
    loadUserId();
  }, []);

  const { data: chatsData, isLoading, isFetching, refetch, error } = useGetChatsQuery({
    search,
    limit: 20,
    lastUpdatedAt,
  }, { skip: !currentUserId });

  const chats = chatsData?.data || [];

  useEffect(() => {
    if (error) {
      console.error("Chat fetch error:", error);
    }
  }, [error]);

  const handleSearch = (text) => {
    setSearch(text);
    setLastUpdatedAt(null); // Reset pagination on search
  };

  const loadMore = () => {
    if (!isFetching && !isLoading && chats.length > 0) {
      const lastChat = chats[chats.length - 1];
      if (lastChat.updatedAt) {
        let date;
        if (lastChat.updatedAt._seconds) {
          date = new Date(lastChat.updatedAt._seconds * 1000);
        } else if (typeof lastChat.updatedAt === 'string') {
          date = new Date(lastChat.updatedAt);
        } else if (lastChat.updatedAt instanceof Date) {
          date = lastChat.updatedAt;
        } else {
          date = new Date();
        }
        setLastUpdatedAt(date.toISOString());
      }
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participantData) return { name: "Topper/Student", profilePhoto: null };
    const otherId = chat.participants.find((id) => id !== currentUserId);
    return (
      chat.participantData[otherId] || { name: "User", profilePhoto: null }
    );
  };

  const renderItem = ({ item }) => {
    const otherUser = getOtherParticipant(item);
    const lastMsg = item.lastMessage?.text || (item.lastMessage?.type === 'image' ? "Sent an image" : "Started a conversation");

    let timeStr = "";
    if (item.updatedAt) {
      const date = item.updatedAt._seconds ? new Date(item.updatedAt._seconds * 1000) : new Date(item.updatedAt);
      timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return (
      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ChatDetails", { chatId: item.id, otherUser })
        }
      >
        <View style={styles.avatarWrapper}>
          <Image
            source={
              otherUser.profilePhoto
                ? { uri: otherUser.profilePhoto }
                : require("../../../assets/topper.avif")
            }
            style={styles.avatar}
          />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <AppText style={styles.name} weight="bold" numberOfLines={1}>
              {otherUser.name}
            </AppText>
            <AppText style={styles.time}>{timeStr}</AppText>
          </View>
          <View style={styles.messageRow}>
            <AppText style={styles.lastMessage} numberOfLines={1}>
              {lastMsg}
            </AppText>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <AppText style={styles.unreadText}>{item.unreadCount}</AppText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !chats.length) return <ScreenLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} weight="bold">
          Messages
        </AppText>
        <TouchableOpacity style={styles.headerActionBtn}>
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search conversations..."
          value={search}
          onChangeText={handleSearch}
          showFilter={false}
        />
      </View>

      {chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetching && chats.length > 0 ? <ActivityIndicator style={{ margin: 20 }} color={Theme.colors.primary} /> : null}
          onRefresh={refetch}
          refreshing={isFetching && !lastUpdatedAt}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="chatbubbles-outline" size={48} color="#64748B" />
          </View>
          <AppText style={styles.emptyText} weight="bold">No messages matching "{search}"</AppText>
          <AppText style={styles.emptySubText}>Try a different name or start a new chat.</AppText>
        </View>
      )}
    </View>
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
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.card,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 15,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#64748B",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#94A3B8",
    flex: 1,
    paddingRight: 10,
  },
  unreadBadge: {
    backgroundColor: "#3B82F6",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ChatList;
