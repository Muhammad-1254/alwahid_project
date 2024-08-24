import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./user.controller";
import {  DatabaseModule, MicroservicesNames, SharedModule } from "@app/shared";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  User,
  AdminUser,
  CreatorUser,
  NormalUser,
  UserBlockAssociation,
  UserFollowingAssociation,
  UserSavedPostsAssociation,
} from "./entities";
import {
  Post,
  PostCommentLike,
  PostComments,
  PostMedia,
} from "apps/micro-post/src/entities";
import { Location } from "apps/micro-location/entities";
import { Hashtag, HashtagPostAssociation } from "apps/micro-hashtag/entities";

@Module({
  imports: [
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
  controllers: [UserController],
  providers: [UserService,],
})
export class UserModule {}
