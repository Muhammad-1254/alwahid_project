import { apiRoutes } from "@/src/constants/apiRoutes";
import cAxios from "@/src/lib/cAxios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PostMediasProps = {
  id: string;
  mimeType: string;
  url: string;
};
export type ProfileTabPostsProps = {
  id: string;
  textContent: string | null;
  createdAt: string;
  postMedias: PostMediasProps[] | null;
};
export type ProfileTabSavedPostsProps = {
  id: string;
  textContent: string | null;
  createdAt: string;
  postMedias: PostMediasProps[] | null;
};
export type ProfileTabLikedPostsProps = {
  id: string;
  textContent: string | null;
  createdAt: string;
  postMedias: PostMediasProps[] | null;
};

export enum ProfileTabEnum {
  SAVED_POSTS = 0,
  LIKED_POSTS = 1,
  POSTS = 2,
}
export type ProfileTabProps = {
  posts: ProfileTabPostsProps[];
  savedPosts: ProfileTabSavedPostsProps[];
  likedPosts: ProfileTabLikedPostsProps[];
  isPostComplete: boolean;
  isSavedPostComplete: boolean;
  isLikedPostComplete: boolean;

  postsCount: number;
  savedPostsCount: number;
  likedPostsCount: number;

  tabIndex: ProfileTabEnum;

  loading: boolean;
  error: string;
};

const profileTabInitialState: ProfileTabProps = {
  posts: [],
  savedPosts: [],
  likedPosts: [],

  isLikedPostComplete: false,
  isPostComplete: false,
  isSavedPostComplete: false,

  postsCount: 0,
  savedPostsCount: 0,
  likedPostsCount: 0,

  tabIndex: 1,
  loading: false,
  error: "",
};

export const fetchProfileTabPosts = createAsyncThunk(
  "profileTab/fetchPosts",
  async (page: { from: number; to: number }) => {
    try {
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabPosts}?from=${page.from}&to=${page.to}`
      );
      return res.data;
    } catch (error) {
      console.log("error from while fetching profile tab posts", error);
      throw error;
    }
  }
);

export const fetchProfileTabLikedPosts = createAsyncThunk(
  "profileTab/fetchLikedPosts",
  async (page: { from: number; to: number }) => {
    try {
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabLikedPosts}?from=${page.from}&to=${page.to}`
      );
      console.log("user like posts data: ", res.data);
      return res.data;
    } catch (error) {
      console.log("error from while fetching profile tab liked posts", error);
      throw error;
    }
  }
);

export const fetchProfileTabSavedPosts = createAsyncThunk(
  "profileTab/fetchSavedPosts",
  async (page: { from: number; to: number }) => {
    try {
      const res = await cAxios.get(
        `${apiRoutes.getUserProfileTabSavedPosts}?from=${page.from}&to=${page.to}`
      );
      return res.data;
    } catch (error) {
      console.log("error from while fetching profile tab saved posts", error);
      throw error;
    }
  }
);

export const profileTabSlice = createSlice({
  name: "profileTabSlice",
  initialState: profileTabInitialState,
  reducers: {
    setProfileTabIndex: (state, action: PayloadAction<ProfileTabEnum>) => {
      state.tabIndex = action.payload;
    },
    setProfileTabLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfileTabError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    setProfileTabPostsData: (
      state,
      action: PayloadAction<ProfileTabPostsProps[]>
    ) => {
      state.posts = action.payload;
    },
    setProfileTabSavedPostsData: (
      state,
      action: PayloadAction<ProfileTabSavedPostsProps[]>
    ) => {
      state.posts = action.payload;
    },
    setProfileTabLikedPostsData: (
      state,
      action: PayloadAction<ProfileTabLikedPostsProps[]>
    ) => {
      state.posts = action.payload;
    },
    setProfileTabInitialData: (state) => {
      state.posts = [];
      state.savedPosts = [];
      state.likedPosts = [];
      state.loading = false;
      state.error = "";
      state.isLikedPostComplete = false;
      state.isPostComplete = false;
      state.isSavedPostComplete = false;
      state.postsCount = 0;
      state.savedPostsCount = 0;
      state.likedPostsCount = 0;
    },
  },
  extraReducers: (builder) => {
    // for posts
    builder.addCase(fetchProfileTabPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProfileTabPosts.fulfilled, (state, action) => {
      if (Array.isArray(state.posts) && state.posts.length > 0) {
        state.posts = [...state.posts, ...action.payload.data];
      } else {
        state.posts = action.payload.data;
      }
      state.postsCount = action.payload.total;
      state.loading = false;
      if (state.posts.length === state.postsCount) {
        state.isPostComplete = true;
      } else {
        state.isPostComplete = false;
      }
    });
    builder.addCase(fetchProfileTabPosts.rejected, (state) => {
      state.loading = false;
      state.error = "Error while fetching profile tab posts";
    });
    // for saved posts
    builder.addCase(fetchProfileTabSavedPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProfileTabSavedPosts.fulfilled, (state, action) => {
      if (Array.isArray(state.savedPosts) && state.savedPosts.length > 0) {
        state.savedPosts = [...state.savedPosts, ...action.payload.data];
      } else {
        state.savedPosts = action.payload.data;
      }
      state.savedPostsCount = action.payload.total;
      state.loading = false;
      if (state.savedPosts.length === state.savedPostsCount) {
        state.isSavedPostComplete = true;
      } else {
        state.isSavedPostComplete = false;
      }
    });
    builder.addCase(fetchProfileTabSavedPosts.rejected, (state) => {
      state.loading = false;
      state.error = "Error while fetching profile tab saved posts";
    });

    // for liked posts
    builder.addCase(fetchProfileTabLikedPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProfileTabLikedPosts.fulfilled, (state, action) => {
      if (Array.isArray(state.likedPosts) && state.likedPosts.length > 0) {
        state.likedPosts = [...state.likedPosts, ...action.payload.data];
      } else {
        state.likedPosts = action.payload.data;
      }
      state.likedPostsCount = action.payload.total;
      state.loading = false;
      if (state.likedPosts.length === state.likedPostsCount) {
        state.isLikedPostComplete = true;
      } else {
        state.isLikedPostComplete = false;
      }
    });
    builder.addCase(fetchProfileTabLikedPosts.rejected, (state) => {
      state.loading = false;
      state.error = "Error while fetching profile tab liked posts";
    });
  },
});

export const {
  setProfileTabIndex,
  setProfileTabError,
  setProfileTabLoading,
  setProfileTabLikedPostsData,
  setProfileTabPostsData,
  setProfileTabSavedPostsData,
  setProfileTabInitialData,
} = profileTabSlice.actions;

export default profileTabSlice.reducer;
