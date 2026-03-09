import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../../config";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/chats`,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Chats"],
  endpoints: (builder) => ({
    initializeChat: builder.mutation({
      query: (targetUserId) => ({
        url: "/init",
        method: "POST",
        body: { targetUserId },
      }),
      invalidatesTags: ["Chats"],
    }),
    sendChatNotification: builder.mutation({
      query: ({ targetUserId, messageText }) => ({
        url: "/notify-message",
        method: "POST",
        body: { targetUserId, messageText },
      }),
      invalidatesTags: ["Chats"],
    }),
    getChats: builder.query({
      query: ({ search, limit = 10, lastUpdatedAt, sortBy = 'desc' }) => ({
        url: "/",
        params: { search, limit, lastUpdatedAt, sortBy },
      }),
      providesTags: ["Chats"],
      // Merge logic for infinite scrolling
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.lastUpdatedAt) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...(currentCache?.data || []), ...(newItems?.data || [])]
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
  }),
});

export const { 
  useInitializeChatMutation, 
  useSendChatNotificationMutation,
  useGetChatsQuery 
} = chatApi;
