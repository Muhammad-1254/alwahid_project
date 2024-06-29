import { configureStore } from "@reduxjs/toolkit";
import mixReducer from "./slices/mix";
import authReducer from "./slices/auth";
import postDetailScreenReducer from "./slices/postDetailsScreen";

export const store = configureStore({
  reducer: {
    mix: mixReducer,
    auth: authReducer,
    postDetail:postDetailScreenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
