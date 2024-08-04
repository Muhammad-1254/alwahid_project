import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cAxios from "../../lib/cAxios";
import { UserRoleEnum } from "@/src/types/user";
import { jwtDecode } from "jwt-decode";
import { apiRoutesProtected } from "@/src/constants/apiRoutes";

type UserDataProps = {
 user:{
  userId: string | null;
  email?: string;
  firstname: string | null;
  lastname: string | null;
  avatarUrl?: string;
  age?: number;
  phoneNumber?: string;
  gender: string | null;
  dateOfBirth?: string;
  authProvider: string | null;
  isVerified: boolean | null;
  isSpecialUser: boolean | null;
 }
 friends:{
   followersCount: string;
   followingCount: string;
  }
};
type AuthInitialStateProps = {
  data: UserDataProps
  isAuthenticated: boolean;
  userRole:UserRoleEnum;
  loading: boolean;
  error: string | null;
};
export const userDataInitialState: UserDataProps = {
 user:{
  userId: null,
  firstname: null,
  lastname: null,
  isVerified: false,
  isSpecialUser: false,
  gender: null,
  authProvider: null,
 },
 friends:{
   followersCount: "",
   followingCount: '',
  },

};

export const authInitialState: AuthInitialStateProps = {
  data: userDataInitialState,
  isAuthenticated: false,
  userRole: UserRoleEnum.NORMAL,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDataProps>) => {
      state.data.user = action.payload.user;
      state.data.friends= action.payload.friends;
    },
    setUserRole: (state, action: PayloadAction<UserRoleEnum>) => {
      state.userRole = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const { setUser, setIsAuthenticated, setUserRole } = authSlice.actions;

export default authSlice.reducer;
