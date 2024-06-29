import { createSlice, PayloadAction } from "@reduxjs/toolkit";



export type postDetailsScreenType={
        id: number;
        postText: string;
        postMedia: {
            type: string;
            url: string;
        }[];
        postBy: {
            username: string;
            profilePic: string;
            isOnline: boolean;
        };
        date: string;
        likesBy: {
            userId: number;
            username: string;
            profileImage: string;
            date: string;
            likeType: string;
        }[];
        commentsBy: {
            userId: number;
            username: string;
            profileImage: string;
            date: string;
            comment: string;
        }[];
    }


const initialState:postDetailsScreenType={
    id:0,
    date:'',
    postMedia:[],
    postText:'',
    postBy:{
        username:'',
        profilePic:'',
        isOnline:false
    },
    likesBy:[],
    commentsBy:[]

}



const postDetailsScreen = createSlice({
    name: "auth",
    initialState:{value:initialState},
    reducers: {
     setPostDetailsScreenData:(state, action: PayloadAction<postDetailsScreenType>)=>{
        state.value = action.payload;
     }  
    }
});

export const {setPostDetailsScreenData  } = postDetailsScreen.actions;

export default postDetailsScreen.reducer;