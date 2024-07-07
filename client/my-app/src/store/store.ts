import { configureStore } from "@reduxjs/toolkit";
import mixReducer from "./slices/mix";
import authReducer from "./slices/auth";
import postDataReducer from "./slices/postData";
import chatScreenReducer from "./slices/chatScreenData";

export const store = configureStore({
  reducer: {
    mix: mixReducer,
    auth: authReducer,
    postDetail:postDataReducer,
    chatScreen:chatScreenReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
