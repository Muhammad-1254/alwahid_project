import {  createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRoleEnum } from "@/src/types/user";

type AuthInitialStateProps = {
  isAuthenticated: boolean;
  userRole:UserRoleEnum;
  loading: boolean;
  error: string | null;
};


export const authInitialState: AuthInitialStateProps = {
  isAuthenticated: false,
  userRole: UserRoleEnum.NORMAL,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<UserRoleEnum>) => {
      state.userRole = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const {  setIsAuthenticated, setUserRole } = authSlice.actions;

export default authSlice.reducer;
