import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ADMIN_API = `${import.meta.env.VITE_API_BASE_URL}/api/v1/`;

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API,
    credentials: "include",
  }),
  tagTypes: ["Toppers", "Notes", "Payouts"],
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (values) => ({
        url: `auth/login`,
        method: "POST",
        body: values,
      }),
    }),
    sendOtp: builder.mutation({
      query: (values) => ({
        url: `auth/send-otp`,
        method: "POST",
        body: values,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (values) => ({
        url: `auth/verify-otp`,
        method: "POST",

        body: values,
      }),
    }),
    getDashboardData: builder.query({
      query: ({ token }) => ({
        url: `dashboard/dashboard`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    }),
    getAllPublicTenders: builder.query({
      query: ({ token }) => ({
        url: `tender/public`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    createProfile: builder.mutation({
      query: ({ formData, token }) => ({
        url: `admin/profile`,
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        },
      }),
    }),

    // Topper Management
    getPendingToppers: builder.query({
      query: (arg) => {
        const isString = typeof arg === "string";
        const token = isString ? arg : arg.token;
        const page = !isString ? arg.page : undefined;
        const limit = !isString ? arg.limit : undefined;
        const search = !isString ? arg.search : undefined;
        const expertiseClass = !isString ? arg.expertiseClass : undefined;
        const stream = !isString ? arg.stream : undefined;
        const board = !isString ? arg.board : undefined;
        const status = !isString ? arg.status : "PENDING";

        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        if (search) params.append("search", search);
        if (expertiseClass) params.append("expertiseClass", expertiseClass);
        if (stream) params.append("stream", stream);
        if (board) params.append("board", board);
        if (status) params.append("status", status);

        return {
          url: `admin/toppers/pending?${params.toString()}`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        };
      },
      providesTags: ["Toppers"],
    }),
    approveTopper: builder.mutation({
      query: ({ id, token }) => ({
        url: `admin/toppers/${id}/approve`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["Toppers"],
    }),
    rejectTopper: builder.mutation({
      query: ({ id, reason, token }) => ({
        url: `admin/toppers/${id}/reject`,
        method: "POST",
        body: { reason },
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["Toppers"],
    }),

    // Note Management
    getPendingNotes: builder.query({
      query: ({ token, status, search }) => ({
        url: `admin/notes/pending?status=${status || 'UNDER_REVIEW'}&search=${search || ''}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Notes"],
    }),
    approveNote: builder.mutation({
      query: ({ id, token }) => ({
        url: `admin/notes/${id}/approve`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["Notes"],
    }),
    rejectNote: builder.mutation({
      query: ({ id, reason, token }) => ({
        url: `admin/notes/${id}/reject`,
        method: "POST",
        body: { reason },
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["Notes"],
    }),
    previewNote: builder.query({
      query: ({ id, token }) => ({
        url: `admin/notes/${id}/preview`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    getStudentUsage: builder.query({
      query: (token) => ({
        url: `admin/students/usage`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    getPayoutRequests: builder.query({
      query: ({ token, status, page, limit }) => ({
        url: `admin/payouts?status=${status || 'PENDING'}&page=${page || 1}&limit=${limit || 10}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["Payouts"],
    }),
    updatePayoutStatus: builder.mutation({
      query: ({ id, status, transactionId, adminRemarks, token }) => ({
        url: `admin/payouts/${id}/status`,
        method: "PATCH",
        body: { status, transactionId, adminRemarks },
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["Payouts"],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetAllPublicTendersQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useCreateProfileMutation,
  useGetPendingToppersQuery,
  useApproveTopperMutation,
  useRejectTopperMutation,
  useGetPendingNotesQuery,
  useApproveNoteMutation,
  useRejectNoteMutation,
  usePreviewNoteQuery,
  useLazyPreviewNoteQuery,
  useGetStudentUsageQuery,
  useGetPayoutRequestsQuery,
  useUpdatePayoutStatusMutation
} = adminApi;
