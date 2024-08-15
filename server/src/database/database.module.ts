import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HashtagPostAssociation } from "src/hashtag/entities/hashtag-post-association.entity";
import { Hashtag } from "src/hashtag/entities/hashtag.entity";
import { Location } from "src/location/entities/location.entity";
import { PostCommentLike } from "src/post/entities/post-comment-like.entity";
import { PostComments } from "src/post/entities/post-comment.entity";
import { PostMedia } from "src/post/entities/post-media.entity";
import { Post  } from "src/post/entities/post.entity";
import { AdminUser } from "src/user/entities/user-admin.entity";
import { UserBlockAssociation } from "src/user/entities/user-block-association.entity";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { UserFollowingAssociation } from "src/user/entities/user-followers-association.entity";
import { NormalUser } from "src/user/entities/user-normal.entity";
import { UserSavedPostsAssociation } from "src/user/entities/user-saved-post.entity";
import { User } from "src/user/entities/user.entity";
import { DatabaseController } from "./database.controller";
import { DatabaseService } from "./database.service";
import { CountryCode } from "./mix-entities/country-code.entity";
import { AwsService } from "src/aws/aws.service";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      

      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.getOrThrow("DATABASE_URL_UNPOOLED"),

        entities: [
          User,
          AdminUser,
          CreatorUser,
          NormalUser,
          UserFollowingAssociation,
          UserBlockAssociation,
          Location,
          Post,
          PostComments,
          PostCommentLike,
          PostMedia,
          Hashtag,
          HashtagPostAssociation,
          UserSavedPostsAssociation,
          CountryCode
  
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      AdminUser,
      CreatorUser,
      NormalUser,
      UserFollowingAssociation,
      UserBlockAssociation,
      Location,
      Post,
      PostComments,
      PostCommentLike,
      PostMedia,
      Hashtag,
      HashtagPostAssociation,
      UserSavedPostsAssociation,
      CountryCode
    ]),
  ],

  controllers: [DatabaseController],
  providers: [DatabaseService, AwsService],
  exports: [
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
