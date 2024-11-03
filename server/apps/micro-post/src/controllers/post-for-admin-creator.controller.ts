import { Controller } from "@nestjs/common";
import { PostService } from "../services/post.service";
import { SharedService } from "@app/shared";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import {
  CreatePostMediaPayloadType,
  CreatePostPayloadType,
  CreatePresignedUrlPayloadType,
  GetUserPersonalPostsPayloadType,
  RemovePostMediaPayloadType,
  RemovePostPayloadType,
  UpdatePostContentPayloadType,
} from "../types/post-payload.type";

@Controller()
export class PostForAdminCreatorController {
  constructor(
    private readonly postService: PostService,
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: "createPost" })
  createPost(
    @Ctx() context: RmqContext,
    @Payload() data: CreatePostPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.createPost(data);
  }

  @MessagePattern({ cmd: "createPresignedUrl" })
  createPresignedUrl(
    @Ctx() context: RmqContext,
    @Payload() data: CreatePresignedUrlPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.createPresignedUrl(data);
  }

  @MessagePattern({ cmd: "createPostMedia" })
  createPostMedia(
    @Ctx() context: RmqContext,
    @Payload() data: CreatePostMediaPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.createPostMedia(data);
  }

  @MessagePattern({ cmd: "getUserPersonalPosts" })
  getUserPersonalPosts(
    @Ctx() context: RmqContext,
    @Payload() data: GetUserPersonalPostsPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.getUserPersonalPosts(data);
  }

  @MessagePattern({ cmd: "updatePostContent" })
  updatePostContent(
    @Ctx() context: RmqContext,
    @Payload() data: UpdatePostContentPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.updatePostContent(data);
  }

  @MessagePattern({ cmd: "removePost" })
  removePost(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.removePost(data);
  }

  @MessagePattern({ cmd: "removePostMedia" })
  removePostMedia(
    @Ctx() context: RmqContext,
    @Payload() data: RemovePostMediaPayloadType,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.postService.removePostMedia(data);
  }
}
