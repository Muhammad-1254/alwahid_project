import { supabase } from "@/src/lib/supabase";
import { buildCreateSlice, createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, User } from "@supabase/supabase-js";
import { act } from "react-test-renderer";



type authSliceType={
    session:Session | null;
    user:User | null;   
    isAuthenticated:boolean;
}

const initialState:authSliceType={
    session:null,
    user:null,
    isAuthenticated:false
}


export const fetchSession = createAsyncThunk('auth/fetchSession', async () => {
    const {data:{session}} = await supabase.auth.getSession();
    return session;
})

export const signInAnonymously = createAsyncThunk("auth/signInAnonymously", async () => {
    await supabase.auth.signInAnonymously() ;
});
const authSlice = createSlice({
    name: "auth",
    initialState:{value:initialState},
    reducers: {
       setSession:(state, action: PayloadAction<Session|null>)=>{
        state.value.session = action.payload;
        state.value.user = action.payload?.user || null;
        state.value.isAuthenticated = !!action.payload?.user && !action.payload.user.is_anonymous;

       }
        },
    extraReducers:(builder) =>{
        builder.addCase(fetchSession.fulfilled,(state,action)=>{
            state.value.session = action.payload;
            state.value.user = action.payload?.user || null;
            state.value.isAuthenticated = !!action.payload?.user && !action.payload.user.is_anonymous;
    
        });
      
    },
    
});

export const { setSession } = authSlice.actions;

export default authSlice.reducer;