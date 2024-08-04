import { PostCommentLike } from "src/post/entities/post-comment-like.entity"
import { UserRoleEnum } from "./user"


export enum PostMediaEnum{
    IMAGE = "image",
    VIDEO = "video",
}


export enum PostUserTypeEnum {
    ADMIN='admin',
    CREATOR='creator',
}




export enum PostLikeTargetEnum {
    POST = "post",
    COMMENT = "comment",
}

export enum PostLikeEnum{
    LIKE = "like",
    WOW = "wow",
    DISLIKE = "dislike",
}


export type commentsResponseDataType = {
    userId:string,
    firstname:string,
    lastname:string,
    avatarUrl:string,
    userRoles:UserRoleEnum[],
    isSpecialUser:boolean,
    isVerified:boolean
    commentId:string,
    commentContent:string,
    commentLikes:PostCommentLike[],
    createdAt:Date
  }

export type postCommentLikesResponseDataType = {
    userId:string,
    firstname:string,
    lastname:string,
    avatarUrl:string,
    userRoles:UserRoleEnum[],
    isSpecialUser:boolean,
    isVerified:boolean,
    likeId:string,
    likeType:PostLikeEnum,
    createdAt:Date

}