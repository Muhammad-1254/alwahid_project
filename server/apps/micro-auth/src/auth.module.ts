import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "apps/micro-user/src/user.module";
import { UserService } from "apps/micro-user/src/services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule, SharedModule } from "@app/shared";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation
} from 'apps/micro-user/src/entities';
import { Post,PostCommentLike,PostComments,PostMedia } from 'apps/micro-post/src/entities';
import { Location, } from 'apps/micro-location/entities';
import { Hashtag,HashtagPostAssociation } from 'apps/micro-hashtag/entities';

@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: `${process.env.JWT_TOKEN_EXPIRY}` },
      verifyOptions: { ignoreExpiration: false },
    }),
   
    TypeOrmModule.forFeature([
      User,AdminUser,CreatorUser,NormalUser,UserBlockAssociation,UserFollowingAssociation,UserSavedPostsAssociation,
      Post,PostCommentLike,PostComments,PostMedia,
      Location,
      Hashtag,
      HashtagPostAssociation
    ]),
    PassportModule,
 SharedModule,
    DatabaseModule,
   
    
  ],
  controllers: [AuthController],
  providers: [AuthService,],
})
export class AuthModule {}
