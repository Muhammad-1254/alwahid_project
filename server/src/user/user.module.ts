import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AwsService } from 'src/aws/aws.service';


@Module({
  controllers: [UserController],
  providers: [UserService, AwsService],
})
export class UserModule {}
