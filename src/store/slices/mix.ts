import { createSlice } from "@reduxjs/toolkit";



type mixSliceType={
    temp:string;
}

const initialState:mixSliceType={
    temp:""
}


export const mixSlice = createSlice({
    name: "mixSlice",
    initialState:{value:initialState},
    reducers: {
        setTemp: (state, action) => {
            state.value.temp = action.payload;
        },
    },
});


export const {setTemp} = mixSlice.actions;
export default mixSlice.reducer;
