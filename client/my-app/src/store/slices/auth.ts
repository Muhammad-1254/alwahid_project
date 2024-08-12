import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cAxios from "../../lib/cAxios";
import { UserRoleEnum } from "@/src/types/user";
import { jwtDecode } from "jwt-decode";

export type UserDataAuthProps={
  
    userId: string ;
    email: string;
    firstname: string;
    lastname: string;
    avatarUrl?: string
    phoneNumber: string
    gender: string ;
    dateOfBirth: string;
    authProvider: string 
    isVerified: boolean 
    isSpecialUser: boolean 
    followersCount: string;
    followingCount: string;
   
}

type UserDataProps = {
 user:UserDataAuthProps

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
  userId: "",
  firstname: "",
  lastname: "",
  isVerified: false,
  isSpecialUser: false,
  gender: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  authProvider:"local",
  followersCount: "0",
  followingCount: "0",

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
    setUser: (state, action) => {
      state.data.user = {...state.data.user, ...action.payload};
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
