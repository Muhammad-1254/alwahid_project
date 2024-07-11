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
    DISLIKE = "dislike",
}


export type commentsResponseDataType = {
    user_id:string,
    firstname:string,
    lastname:string,
    avatar_url:string,
    user_role:UserRoleEnum,
    is_special_user:boolean,
    is_verified:boolean
    comment_id:string,
    commentContent:string,
    commentLikes:PostCommentLike[],
    created_at:Date
  }

export type postCommentLikesResponseDataType = {
    user_id:string,
    firstname:string,
    lastname:string,
    avatar_url:string,
    user_role:UserRoleEnum,
    is_special_user:boolean,
    is_verified:boolean,
    like_id:string,
    like_type:PostLikeEnum,
    created_at:Date

}