import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/notifications`,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 }) => `?page=${page}&limit=${limit}`,
      providesTags: ['Notification'],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        currentCache.data.notifications.push(...newItems.data.notifications);
        currentCache.data.pagination = newItems.data.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    
    savePushToken: builder.mutation({
      query: (token) => ({
        url: '/token',
        method: 'POST',
        body: { token },
      }),
    }),
    
    removePushToken: builder.mutation({
      query: (token) => ({
        url: '/token',
        method: 'DELETE',
        body: { token },
      }),
    }),

    markAsRead: builder.mutation({
      query: (notificationIds) => ({
        url: '/read',
        method: 'PATCH',
        body: { notificationIds }
      }),
      invalidatesTags: ['Notification']
    }),
    
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
            if (draft?.data?.notifications) {
                draft.data.notifications = draft.data.notifications.filter(n => n._id !== id);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    })
  }),
});

export const {
  useGetNotificationsQuery,
  useSavePushTokenMutation,
  useRemovePushTokenMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation
} = notificationApi;
