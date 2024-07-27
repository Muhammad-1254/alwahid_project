import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cAxios from "../../lib/cAxios";


type UserDataProps = {
  userId: string | null;
  email?: string;
  firstname: string | null;
  lastname: string | null;
  avatar?: string;
  age?: number;
  phoneNumber?: string;
  gender: string | null;
  role: string | null;
  dob?: string;
  authProvider: string | null;
  isVerified: boolean | null;
  isSpecialUser: boolean | null;

};
type AuthInitialStateProps={
  data: UserDataProps;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

}
export const userDataInitialState:UserDataProps={
  userId: null,
  firstname: null,
  lastname: null,
  isVerified: false,
  isSpecialUser: false,
  role: "hello",
  gender: null,
  authProvider: null
}
export const authInitialState:AuthInitialStateProps= {
  data:userDataInitialState,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const getUser = createAsyncThunk(
  "getUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cAxios.get("/user/protected");
      console.log("res data after getUser", res.data)
      return res.data;
    } catch (error: any) {
      console.error("error from getUser", error);
      // Check if it's an AxiosError and handle accordingly
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue("No response received from the server");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState :authInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserDataProps>) => {
      state.data = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      console.log("checking user data from slice: ",state.data.email)

    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, setIsAuthenticated } = authSlice.actions;

export default authSlice.reducer;
