import { Module } from "@nestjs/common";
import { PostService } from "./services/post.service";
import { PostController } from "./controllers/post-unsecure.controller";
import { PostForAdminCreatorController } from "./controllers/post-for-admin-creator.controller";
import { PostForAdminController } from "./controllers/post-for-admin.controller";
import { PostAllUsersController } from "./controllers/post-for-all-users.controller";

import { UserService } from "apps/micro-user/src/user.service";
import { DatabaseModule, MicroservicesNames, SharedModule } from "@app/shared";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AdminUser,
  CreatorUser,
  Hashtag,
  HashtagPostAssociation,
  Location,
  NormalUser,
  Post,
  PostCommentLike,
  PostComments,
  PostMedia,
  User,
  UserBlockAssociation,
  UserFollowingAssociation,
  UserSavedPostsAssociation,
} from "@app/shared/entities";
@Module({
  imports :[
    DatabaseModule,
    SharedModule,
    SharedModule.registerRMQ(MicroservicesNames.AWS_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AWS),
    TypeOrmModule.forFeature([
      User,
      AdminUser,
      CreatorUser,
      NormalUser,
      UserBlockAssociation,
      UserFollowingAssociation,
      UserSavedPostsAssociation,
      Post,
      PostCommentLike,
      PostComments,
      PostMedia,
      Location,
      Hashtag,
      HashtagPostAssociation,
    ]),
  ],
  controllers: [
    PostController,
    PostForAdminCreatorController,
    PostForAdminController,
    PostAllUsersController,
  ],
  providers: [PostService, UserService,],
})
export class PostModule {}
