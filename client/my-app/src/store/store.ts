import { combineReducers, configureStore } from "@reduxjs/toolkit";
import mixReducer from "./slices/mix";
import authReducer from "./slices/auth";
import postDataReducer from "./slices/postData";
import newPostReducer from "./slices/addPost";
import userInformationReducer from "./slices/userInformation";

import chatScreenReducer from "./slices/chatScreenData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";

const rootReducer = combineReducers({
  mix: mixReducer,
  auth: authReducer,
  postDetail: postDataReducer,
  newPost: newPostReducer,
  chatScreen: chatScreenReducer,
  userInformation: userInformationReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["userInformation"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["register", "rehydrate"],
      },
    });
  },
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
