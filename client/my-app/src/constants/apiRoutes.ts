// const prefix = `${process.env.EXPO_PUBLIC_SERVER_DOMAIN_DEV}/api`;
const prefix = `http://192.168.2.107:3000/api`;
// const prefix = `https://alwahid.vercel.app/api`;

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

  // user profile
  getProfileAvatarPresignedUrl: `${prefix}/user/profile/avatar/presigned-url`, // body:{filename:string, fileSize:number, mimeType:string}




  /////////// GET  ////////////////
  //   profile
  getUserProfileData: `${prefix}/user/get/profile`,
  getUserProfileTabPosts: `${prefix}/post/user/personal`,
  getUserProfileTabLikedPosts: `${prefix}/post/user/liked/personal`,
  getUserProfileTabSavedPosts: `${prefix}/post/user/saved/personal`,

  // user posts
  getSinglePostData :`${prefix}/unsecure/post`, // unsecure
  getAllPostComments: `${prefix}/post/comments/all`,  // for all users /951b6bb5-b71c-4337-81f7-2679093f2c39?skip=0&take=2
  getAllPostLikes:`${prefix}/post/likes/all`,           // for all postLikes /951b6bb5-b71c-4337-81f7-2679093f2c39?skip=0&take=10&isLatest=false
  getAllPostCommentLikes:`${prefix}/post/comment/likes/all`,           // for all postComment likes /951b6bb5-b71c-4337-81f7-2679093f2c39?skip=0&take=10&isLatest=false
  

  // users related
  getUsersSearch: `${prefix}/user/search`, // query query=> {query:string}
  
  // mix
  getAllCountryFlagsCode: `${prefix}/mix/get/all/country-code`,

///////////// PUT ////////////////


///////////// PATCH ////////////////
  // user posts
  updatePostCommentLike :`${prefix}/post/comment/like`, // body=> commentId, likeType
  updatePostLike: `${prefix}/post/like`,  // body=> postId, likeType
  updateUserBasicInformation: `${prefix}/user/basic/information` , // body=> 
  
  // user profile
  updateUserProfileAvatar: `${prefix}/user/profile/avatar`, // body=> {key:string}
  /////////////// DELETE ////////////////
 // user posts
  removePostCommentLike :`${prefix}/post/comment/like`, // Param=> commentId
  removePostLike: `${prefix}/post/like`,  // Param=> postId
  removePostSave: `${prefix}/post/save`,  // Param=> postId


};


export const apiChatRoutes = {

// websocket connection
  wsUrl: `http://192.168.2.107:3001`, // get

  // REST API
  createNewUserInChatSection: `${prefix}/chats/new/user`, // post
  getUserOnChatSection: `${prefix}/chats/check/user`, // get
  createNewGroup: `${prefix}/chats/group/new`, // post
  addUserInGroup: `${prefix}/chats/group/add-users`, // post
  updateGroupInfo: `${prefix}/chats/group/update/info`, // patch
  removeUsersFromGroup: `${prefix}/chats/group/remove/user`, // delete
}


