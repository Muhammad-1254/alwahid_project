import {  DatabaseModule, MicroservicesNames, SharedModule, SharedService } from "@app/shared";
import { Module } from "@nestjs/common";
import exp from "constants";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { RedisCacheModule } from "@app/shared/modules/redis-cache.module";
import { ChatDatabaseModule } from "./chat-database.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminUser, CreatorUser, NormalUser, User } from "@app/shared/entities/micro-user.entities";
import { ChatController } from "./chat.controller";


@Module({
    imports: [
        ChatDatabaseModule,
        DatabaseModule,
        RedisCacheModule,
        SharedModule.registerRMQ(MicroservicesNames.AUTH_SERVICE, process.env.RABBITMQ_QUEUE_NAME_AUTH),
        SharedModule.registerRMQ(MicroservicesNames.USER_SERVICE, process.env.RABBITMQ_QUEUE_NAME_USER),

        TypeOrmModule.forFeature([
            User,
            AdminUser,
            CreatorUser,
            NormalUser,
    ])
        
    ],
    controllers:[ChatController],
    providers: [
        ChatService,
        ChatGateway
    ]
})
export class ChatModule {}