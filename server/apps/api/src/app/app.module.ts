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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),

      // CacheModule.registerAsync({
      //   isGlobal: true,
      //   imports: [ConfigModule],
      //   inject: [ConfigService],
      //   useFactory:async (configService:ConfigService)=>({
      //     store:await redisStore({
      //       socket:({
      //         // host: await configService.getOrThrow('REDIS_HOST') || 'localhost',
      //         // port: await configService.getOrThrow('REDIS_PORT')|| 6379,
      //         host: 'localhost',
      //         port: 6379,
      //       })
      //     })
      //   })
      // }),

      DatabaseModule,
      
   
    SharedModule.registerRMQ(MicroservicesNames.AUTH_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AUTH),
    SharedModule.registerRMQ(MicroservicesNames.USER_SERVICE, process.env.RABBITMQ_QUEUE_NAME_USER),
    SharedModule.registerRMQ(MicroservicesNames.POST_SERVICE, process.env.RABBITMQ_QUEUE_NAME_POST),
    SharedModule.registerRMQ(MicroservicesNames.POST_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AWS),

   
  


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
    PostController
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
