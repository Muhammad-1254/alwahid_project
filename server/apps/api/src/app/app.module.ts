import { Module } from "@nestjs/common";
import { AppController } from "./controllers/app/app.controller";
import { AppService } from "./app.service";
import { ConfigModule,  } from "@nestjs/config";


import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule, MicroservicesNames, SharedModule } from "@app/shared";
import { UserController } from "./controllers/user/user.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { PostAdminController } from "./controllers/post/post.admin.controller";
import { PostAdminCreatorController } from "./controllers/post/post.admin-creator.controller";
import { PostAllUsersController } from "./controllers/post/post.all-users.controller";
import { PostController } from "./controllers/post/post.unsecure.controller";
import { JwtService } from "@nestjs/jwt";
import { ChatController } from "./controllers/chat/chat.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
   
    SharedModule.registerRMQ(MicroservicesNames.AUTH_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AUTH),
    SharedModule.registerRMQ(MicroservicesNames.USER_SERVICE, process.env.RABBITMQ_QUEUE_NAME_USER),
    SharedModule.registerRMQ(MicroservicesNames.POST_SERVICE, process.env.RABBITMQ_QUEUE_NAME_POST),
    SharedModule.registerRMQ(MicroservicesNames.AWS_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AWS),
    SharedModule.registerRMQ(MicroservicesNames.CHAT_SERVICE, process.env.RABBITMQ_QUEUE_NAME_CHAT),
    SharedModule.registerRMQ(MicroservicesNames.NOTIFICATION_SERVICE, process.env.RABBITMQ_QUEUE_NAME_NOTIFICATION),

  


    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000, // ms => 1 second
        limit: 10,
      },
      {
        name: "long",
        ttl: 6000*1000, // ms => 1 minute 
        limit: 300,
      },
    ]),
  ],
  controllers: [
    UserController,
    AuthController,
    AppController,
    PostAdminController,
    PostAdminCreatorController,
    PostAllUsersController,
    PostController,
    ChatController
  ],
  providers: [
     AppService,  
     JwtService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  
  ],
})
export class AppModule {}
