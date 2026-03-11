import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  // Cache time: unused data is kept for 5 minutes before being garbage collected
  keepUnusedDataFor: 300,
  // Global refetch policies
  refetchOnMountOrArgChange: 60,  // refetch if data is older than 60 seconds when component mounts
  refetchOnReconnect: true,        // always refetch when user comes back online
  tagTypes: ["Referral", "ReferralHistory"],
  endpoints: () => ({}),
});
