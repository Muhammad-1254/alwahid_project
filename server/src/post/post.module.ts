import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostForAnyUserController } from "./controllers/post-unsecure.controller";
import { PostForAdminCreatorController } from "./controllers/post-for-admin-creator.controller";
import { PostForAdminController } from "./controllers/post-for-admin.controller";
import { PostForAllUsersController } from "./controllers/post-for-all-users.controller";

import { UserService } from "src/user/user.service";

@Module({
  controllers: [
    PostForAnyUserController,
    PostForAdminCreatorController,
    PostForAdminController,
    PostForAllUsersController,
  ],
  providers: [PostService, UserService],
})
export class PostModule {}
