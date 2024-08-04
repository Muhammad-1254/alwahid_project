const prefix = `${process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV}/api`;

export const apiRoutes = {

    //////////// POST ////////////////
    // auth
  signup: `${prefix}/auth/create/normal/user`,
  login: `${prefix}/auth/login`,
  getAccessToken: `${prefix}/auth/refresh-token`,

  // user posts
  createPostMediaPresignedUrl: `${prefix}/post/presigned-url`,
  createPost: `${prefix}/post/create`,


  /////////// GET  ////////////////
  //   profile
  getUserProfileData: `${prefix}/user/get/profile`,
  getUserProfileTabPosts: `${prefix}/post/user/personal`,
  getUserProfileTabLikedPosts: `${prefix}/post/user/liked/personal`,
  getUserProfileTabSavedPosts: `${prefix}/post/user/saved/personal`,

  // user posts
  getSinglePostData :`${prefix}/unsecure/post` // unsecure


};
