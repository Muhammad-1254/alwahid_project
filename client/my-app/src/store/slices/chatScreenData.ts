import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TMessage ={
  messageId: number;
  message: string;
  dateTime: string;
  isSent: boolean;
}[];
export type TChat  = {
    userId: number;
    profileImage: string;
    username: string;
    lastMessage: string;
    lastMessageTime: string;
    messages:TMessage
}

export type TChats=TChat[]

export type TChatsData={
chatScreen:TChats;
chatDetailsScreen:TChat;
}
const initialState:TChatsData={
    chatScreen:[],
    chatDetailsScreen:{
        userId:0,
        profileImage:'',
        username:'',
        lastMessage:'',
        lastMessageTime:'',
        messages:[]
    }
  
}


const chatScreenSlice = createSlice({
    name: "chatScreenSlice",
    initialState:{value:initialState},
    reducers: {
      setChatScreenData:(state, action: PayloadAction<TChats>)=>{
        state.value.chatScreen = action.payload;
      },
      setChatDetailsScreenData:(state, action: PayloadAction<TChat>)=>{
        state.value.chatDetailsScreen = action.payload;
      
      }
    }
});

export const { setChatDetailsScreenData,setChatScreenData} = chatScreenSlice.actions;

export default chatScreenSlice.reducer;