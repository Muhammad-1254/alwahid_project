import { CreatePostCommentDto, CreatePostCommentLikeDto, CreatePostDto, CreatePostLikeDto, CreatePostMediaDto, CreatePresignedUrlDto, CreateUserSavedPostDto, JwtAuthGuardTrueType, UpdatePostCommentContentDto, UpdatePostCommentLikeDto, UpdatePostContentDto } from "@app/shared";


export type FindOnePostPayloadType = {
    postId: string;
    userId?: string;
}

export type CreatePostCommentPayloadType = {
    user:JwtAuthGuardTrueType,
    createPostCommentDto: CreatePostCommentDto,
}

export type CreateLikePostPayloadType = {
    user:JwtAuthGuardTrueType,
    createPostLikeDto: CreatePostLikeDto,
}
export type CreateSavePostPayloadType = {
    user:JwtAuthGuardTrueType,
    createUserSavedPostDto: CreateUserSavedPostDto,
} 

export type CreatePostCommentLikePayloadType = {
    user:JwtAuthGuardTrueType,
    createPostCommentLikeDto: CreatePostCommentLikeDto,
}

export type FindUserPersonalLikedPostsPayloadType = {
    user:JwtAuthGuardTrueType,
    skip:number,
    take:number,
}

export type GetAllPostsPayloadType={
    user: JwtAuthGuardTrueType,
    isLatest:boolean;
    skip:number,
    take:number
}
export type GetAllCommentsPayloadType={
    user: JwtAuthGuardTrueType,
    postId:string;
    isLatest:boolean;
    skip:number,
    take:number
}

export type UpdatePostLikePayloadType={
    user: JwtAuthGuardTrueType,
    createPostLikeDto:CreatePostLikeDto
}
export type UpdatePostCommentContentPayloadType={
    user: JwtAuthGuardTrueType,
    updatePostCommentContentDto:UpdatePostCommentContentDto
}

export type UpdatePostCommentLikePayloadType={
    user: JwtAuthGuardTrueType,
    updatePostCommentLikeDto:UpdatePostCommentLikeDto
}

export type RemovePostCommentPayloadType={
    user: JwtAuthGuardTrueType,
    commentId:string
}
export type RemovePostLikePayloadType={
    user: JwtAuthGuardTrueType,
    postId:string
}

export type CreatePostPayloadType={
    user: JwtAuthGuardTrueType,
    createPostDto:CreatePostDto
}

export type CreatePresignedUrlPayloadType={
    user: JwtAuthGuardTrueType,
    createPresignedUrlDto:CreatePresignedUrlDto[]
}

export type CreatePostMediaPayloadType={
    user: JwtAuthGuardTrueType,
    createPostMediaDto:CreatePostMediaDto
}
export type GetUserPersonalPostsPayloadType={
    user: JwtAuthGuardTrueType,
    skip:number,
    take:number
}

export type UpdatePostContentPayloadType={
    user: JwtAuthGuardTrueType,
    updatePostContentDto:UpdatePostContentDto
}
export type RemovePostPayloadType={
    user: JwtAuthGuardTrueType,
    postId:string
}

export type RemovePostMediaPayloadType={
    user: JwtAuthGuardTrueType,
    postId:string
    mediaId:string
}