import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentPickerAsset } from "expo-document-picker";
export type TGetSimilarHashtagByNameResponse = {
  count: number;
  hashtag: {
    id: string;
    name: string;
  };
}[];

export type GetSimilarFriendsZoneByNameResponse = {
  isOnline?: boolean;
  user: {
    userId: string;
    firstname: string;
    lastname: string;
    avatar: string;
  };
}[];

type NewPostProps = {
  text: string;
  postMedias: DocumentPickerAsset[];
  modalResponseData:
    | TGetSimilarHashtagByNameResponse
    | GetSimilarFriendsZoneByNameResponse;
  uploadError: string;
};

const initialState: NewPostProps = {
  text: "",
  postMedias: [],
  modalResponseData: [],
  uploadError: "",
};

const newPostSlice = createSlice({
  name: "newPostSlice",
  initialState,
  reducers: {
    setNewPostText: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    setNewPostMedia: (state, action: PayloadAction<DocumentPickerAsset[]>) => {
      state.postMedias = action.payload;
    },

    setModalResponseData: (state, action) => {
      state.modalResponseData = action.payload;
    },
   
    setPostUploadError: (state, action: PayloadAction<string>) => {
      state.uploadError = action.payload;
    },
  },
});

export const {
  setNewPostMedia,
  setNewPostText,
  setModalResponseData,
  setPostUploadError,
} = newPostSlice.actions;

export default newPostSlice.reducer;
