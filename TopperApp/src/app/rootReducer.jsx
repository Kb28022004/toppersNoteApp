import { combineReducers } from "@reduxjs/toolkit";

import { authApi } from "../features/api/authApi";
import { studentApi } from "../features/api/studentApi";
import { topperApi } from "../features/api/topperApi";
import { adminApi } from "../features/api/adminApi";
import { noteApi } from "../features/api/noteApi";
import { paymentApi } from "../features/api/paymentApi";
import { notificationApi } from "../features/api/notificationApi";
import { chatApi } from "../features/api/chatApi";
import usageReducer from "../features/usageSlice";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [studentApi.reducerPath]: studentApi.reducer,
  [topperApi.reducerPath]: topperApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [noteApi.reducerPath]: noteApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  usage: usageReducer,
});

export default rootReducer;
