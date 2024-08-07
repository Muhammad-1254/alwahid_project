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
  createPostLike: `${prefix}/post/like`, // body=> postId, likeType
  createPostSave: `${prefix}/post/save`,  // body=> postId
  createPostCommentLike: `${prefix}/post/comment/like`, // body=> commentId, likeType






  /////////// GET  ////////////////
  //   profile
  getUserProfileData: `${prefix}/user/get/profile`,
  getUserProfileTabPosts: `${prefix}/post/user/personal`,
  getUserProfileTabLikedPosts: `${prefix}/post/user/liked/personal`,
  getUserProfileTabSavedPosts: `${prefix}/post/user/saved/personal`,

  // user posts
  getSinglePostData :`${prefix}/unsecure/post`, // unsecure
  getAllPostComments: `${prefix}/post/comments/all`,  //for all users /951b6bb5-b71c-4337-81f7-2679093f2c39?from=0&to=2


///////////// PUT ////////////////


///////////// PATCH ////////////////
  // user posts
  updatePostCommentLike :`${prefix}/post/comment/like`, // body=> commentId, likeType

  /////////////// DELETE ////////////////
 // user posts
  deletePostCommentLike :`${prefix}/post/comment/like`, // body=> commentId


};
