import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { UserModule } from "./user/user.module";
import { MyLoggerModule } from './my-logger/my-logger.module';
import { PostModule } from "./post/post.module";
import { HashtagModule } from './hashtag/hashtag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    MyLoggerModule,
    PostModule,
    HashtagModule,

    // ThrottlerModule.forRoot([
    //   {
    //     name: "short",
    //     ttl: 1000, // ms => 1 second
    //     limit: 10,
    //   },
    //   {
    //     name: "long",
    //     ttl: 6000*1000, // ms => 1 minute 
    //     limit: 300,
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
