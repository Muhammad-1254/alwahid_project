import { Module } from "@nestjs/common";
import { PostService } from "./services/post.service";
import { PostController } from "./controllers/post-unsecure.controller";
import { PostForAdminCreatorController } from "./controllers/post-for-admin-creator.controller";
import { PostForAdminController } from "./controllers/post-for-admin.controller";
import { PostAllUsersController } from "./controllers/post-for-all-users.controller";

import { UserService } from "apps/micro-user/src/services/user.service";
import { DatabaseModule, MicroservicesNames, SharedModule } from "@app/shared";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation
} from 'apps/micro-user/src/entities';
import { Post,PostCommentLike,PostComments,PostMedia } from 'apps/micro-post/src/entities';
import { Location, } from 'apps/micro-location/entities';
import { Hashtag,HashtagPostAssociation } from 'apps/micro-hashtag/entities';


@Module({
  imports :[
    DatabaseModule,
    SharedModule.registerRMQ(MicroservicesNames.AWS_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AWS),
    SharedModule,
    TypeOrmModule.forFeature([
      User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation,
      Post,PostCommentLike,PostComments,PostMedia,
      Location,
      Hashtag,
      HashtagPostAssociation
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
