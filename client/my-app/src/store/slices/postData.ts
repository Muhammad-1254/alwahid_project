import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type TPostUserLikes= {
        userId: number;
        username: string;
        profileImage: string;
        date: string;
        likeType: string;
    }[];

export type TPostUserComments={
     
        userId: number;
        username: string;
        profileImage: string;
        date: string;
        comment: string;
    }[];

export type TPostMedia={
    type: string;
    url: string;
}[];

export type TPost={
        id: number;
        postText: string;
        postMedia: TPostMedia;
        postBy: {
            username: string;
            profilePic: string;
            isOnline: boolean;
        };
        date: string;
        likesBy: TPostUserLikes
        commentsBy:TPostUserComments
    }
export type TPostData  = {
    homePagePostData:TPost[];
    postDetailsScreen:TPost;
}


const initialState:TPostData={
    homePagePostData:[],
    postDetailsScreen:{
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
}


const postScreenSlice = createSlice({
    name: "postScreenSlice",
    initialState:{value:initialState},
    reducers: {
        setPostDetailsData:(state, action: PayloadAction<TPost>)=>{
        state.value.postDetailsScreen = action.payload;
     },
     setHomePageData:(state,action:PayloadAction<TPost[]>)=>{
        state.value.homePagePostData = action.payload
     }
    }
});

export const {setHomePageData,setPostDetailsData  } = postScreenSlice.actions;

export default postScreenSlice.reducer;