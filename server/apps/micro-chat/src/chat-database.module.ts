import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import {Chat,Group,Message,User,UserGroupsAssociation,UserChatAssociation} from "./entities";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => 
      {
        // const paths = join(__dirname, "apps/micro-chat/src/migrations/*{.ts,.js}");
        // console.log("paths: ",paths);
        return({
        type: "postgres",
        url: await configService.getOrThrow("DATABASE_CHAT_URL_UNPOOLED"),
        entities: [
          Chat,Group,Message,User,UserGroupsAssociation,UserChatAssociation
        ],
        migrations: [],
        autoLoadEntities: false,
        synchronize: false,
  
      })},
    }),
    TypeOrmModule.forFeature([
      Chat,
      Group,
      Message,
      User,
      UserGroupsAssociation,
    ]),
  ],
  providers: [],
})
export class ChatDatabaseModule {}
