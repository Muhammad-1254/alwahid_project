import { createSlice } from "@reduxjs/toolkit";
import { Animated } from "react-native";



type ProfileSliceType={
    listScrollY:Animated.Value|null;
}

const initialState:ProfileSliceType={
    listScrollY:null
}


export const mixSlice = createSlice({
    name: "profileSlice",
    initialState,
    reducers: {
    setListScrollY:(state,actions)=>{
        state.listScrollY=actions.payload
    },
    },
});


export const {setListScrollY} = mixSlice.actions;
export default mixSlice.reducer;
