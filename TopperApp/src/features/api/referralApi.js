import { apiSlice } from "./apiSlice";

export const referralApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReferralStats: builder.query({
      query: () => "/referrals/stats",
      providesTags: ["Referral"],
    }),
    getReferralHistory: builder.query({
      query: () => "/referrals/history",
      providesTags: ["ReferralHistory"],
    }),
  }),
});

export const { useGetReferralStatsQuery, useGetReferralHistoryQuery } = referralApi;
