import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostService } from 'src/post/post.service';


@Module({
  controllers: [UserController],
  providers: [PostService, UserService],
})
export class UserModule {}
