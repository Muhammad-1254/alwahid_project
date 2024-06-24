import { configureStore } from "@reduxjs/toolkit";
import mixReducer from "./slices/mix";
import authReducer from "./slices/auth";

export const store = configureStore({
  reducer: {
    mix: mixReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
