import {
  Controller,
} from "@nestjs/common";
import { PostService } from "../services/post.service";
import {SharedService,} from "@app/shared";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { CreateLikePostPayloadType,
  CreatePostCommentPayloadType,
  CreatePostCommentLikePayloadType,
  CreateSavePostPayloadType,
  FindUserPersonalLikedPostsPayloadType,
  GetAllCommentsPayloadType,
  GetAllPostsPayloadType,
  UpdatePostLikePayloadType,
  UpdatePostCommentContentPayloadType,
  UpdatePostCommentLikePayloadType,
  RemovePostCommentPayloadType,
  RemovePostLikePayloadType
 } from "../types/post-payload.type";

@Controller()
export class PostAllUsersController {
  constructor(
    private readonly postService: PostService,
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: "createPostComment" })
  createPostComment(
    @Ctx() context: RmqContext,
    @Payload() data: CreatePostCommentPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    this.postService.createPostComment(data);
  }
  @MessagePattern({ cmd: "createLikePost" })
  createLikePost(
    @Ctx() context: RmqContext,
    @Payload() data: CreateLikePostPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    this.postService.createLikePost(data);
  }

  @MessagePattern({ cmd: "createSavePost" })
  createSavePost(
    @Ctx() context: RmqContext,
    @Payload() data: CreateSavePostPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.createSavePost(data);
  }

  @MessagePattern({ cmd: "createPostCommentLike" })
  createPostCommentLike(
    @Ctx() context: RmqContext,
    @Payload() data: CreatePostCommentLikePayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    this.postService.createPostCommentLike(data);
  }

  @MessagePattern({ cmd: "findUserPersonalLikedPosts" })
  findUserPersonalLikedPosts(
    @Ctx() context: RmqContext,
    @Payload() data: FindUserPersonalLikedPostsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.findUserPersonalLikedPosts(data);
  }
  @MessagePattern({ cmd: "findUserPersonalSavedPosts" })
  findUserPersonalSavedPosts(
    @Ctx() context: RmqContext,
    @Payload() data: FindUserPersonalLikedPostsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.findUserPersonalSavedPosts(data);
  }

  @MessagePattern({cmd:"getAllPosts"})
  getAllPosts(
    @Ctx() context: RmqContext,
    @Payload() data: GetAllPostsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.getAllPosts(data);
  }

  @MessagePattern({cmd:"getAllComments"})
  getAllComments(
    @Ctx() context: RmqContext,
    @Payload() data: GetAllCommentsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.getAllComments(data);
  }

  @MessagePattern({cmd:"getAllPostLikes"})
  getAllPostLikes(
    @Ctx() context: RmqContext,
    @Payload() data: GetAllCommentsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.getAllPostLikes(data);
  }

  @MessagePattern({cmd:"getAllCommentLikes"})
  getAllCommentLikes(
    @Ctx() context: RmqContext,
    @Payload() data: GetAllCommentsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.getAllCommentLikes(data);
  }

  @MessagePattern({cmd:"updatePostLike"})
  updatePostLike(
    @Ctx() context: RmqContext,
    @Payload() data: UpdatePostLikePayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.updatePostLike(data);
  }
  @MessagePattern({cmd:"updatePostCommentContent"})
  updatePostCommentContent(
    @Ctx() context: RmqContext,
    @Payload() data: UpdatePostCommentContentPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.updatePostCommentContent(data);
  }
  @MessagePattern({cmd:"updatePostCommentLike"})
  updatePostCommentLike(
    @Ctx() context: RmqContext,
    @Payload() data: UpdatePostCommentLikePayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    this.postService.updatePostCommentLike(data);
  }

  @MessagePattern({cmd:"removePostComment"})
  removePostComment(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostCommentPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.removePostComment(data);
  }
  @MessagePattern({cmd:"removePostLike"})
  removePostLike(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostLikePayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.removePostLike(data);
  }
  @MessagePattern({cmd:"removeUserSavePost"})
  removeUserSavePost(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostLikePayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.removeUserSavePost(data);
  }
  @MessagePattern({cmd:"removePostCommentLike"})
  removePostCommentLike(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostCommentPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    this.postService.removePostCommentLike(data);
  }
}
