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
  uploadLoading: boolean;
  uploadProgress: number;
  uploadError: string;
};

const initialState: NewPostProps = {
  text: "",
  postMedias: [],
  modalResponseData: [],
  uploadLoading: false,
  uploadProgress: 0,
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
    setPostUploadLoading: (state, action: PayloadAction<boolean>) => {
      state.uploadLoading = action.payload;
    },
    setPostUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
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
  setPostUploadLoading,
  setPostUploadProgress,
} = newPostSlice.actions;

export default newPostSlice.reducer;
