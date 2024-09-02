import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
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
  imports: [
    DatabaseModule,
    SharedModule,
    SharedModule.registerRMQ(
      MicroservicesNames.AWS_SERVICE,
      process.env.RABBITMQ_QUEUE_NAME_AWS,
    ),
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
  providers: [UserService],
})
export class UserModule {}
