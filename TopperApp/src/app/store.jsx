import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import rootReducer from "./rootReducer";
import { authApi } from "../features/api/authApi";
import { studentApi } from "../features/api/studentApi";
import { topperApi } from "../features/api/topperApi";
import { adminApi } from "../features/api/adminApi";
import { noteApi } from "../features/api/noteApi";

import { paymentApi } from "../features/api/paymentApi";

import { notificationApi } from "../features/api/notificationApi";
import { chatApi } from "../features/api/chatApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      authApi.middleware,
      studentApi.middleware,
      topperApi.middleware,
      adminApi.middleware,
      noteApi.middleware,
      paymentApi.middleware,
      notificationApi.middleware,
      chatApi.middleware
    ),
});
