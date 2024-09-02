import { Controller } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { JwtAuthGuardTrueType, SharedService } from "@app/shared";
import { AddUserInChatGroupPayloadType, CreateChatGroupPayloadType, CreateNewUserInChatSectionPayloadType, LeaveChatGroupPayloadType, UpdateChatGroupPayloadType } from "./types/chat-payload.type";



@Controller()
export class ChatController{
    constructor(
        private readonly chatService:ChatService,
        private readonly sharedService:SharedService,
    ){}

    @MessagePattern({cmd:"createNewUserInChatSection"})
    async createNewUserInChatSection(
        @Ctx() context:RmqContext,
        @Payload() data:CreateNewUserInChatSectionPayloadType
    ){
    this.sharedService.acknowledgeMessage(context)
       return await this.chatService.createNewUserInChatSection(data)
    }

    @MessagePattern({cmd:"createChatGroup"})
    async createChatGroup(
        @Ctx() context:RmqContext,
        @Payload() data:CreateChatGroupPayloadType
    ){
    this.sharedService.acknowledgeMessage(context)
    console.log("data: ",data)
    return this.chatService.createChatGroup(data)

    }
    @MessagePattern({cmd:"addUserInChatGroup"})
    async addUserInChatGroup(
        @Ctx() context:RmqContext,
        @Payload() data:AddUserInChatGroupPayloadType
    ){
    this.sharedService.acknowledgeMessage(context)
    console.log("data: ",data)
    return this.chatService.addUserInChatGroup(data)

    }


    @MessagePattern({cmd:"updatedChatGroupInfo"})
    async updatedChatGroupInfo(
        @Ctx() context:RmqContext,
        @Payload() data:UpdateChatGroupPayloadType
    ){
    this.sharedService.acknowledgeMessage(context)
    console.log("data: ",data)
    return this.chatService.updatedChatGroupInfo(data)

    }
    @MessagePattern({cmd:"leaveChatGroup"})
    async leaveChatGroup(
        @Ctx() context:RmqContext,
        @Payload() data:LeaveChatGroupPayloadType
    ){
    this.sharedService.acknowledgeMessage(context)
    console.log("data: ",data)
    return this.chatService.leaveChatGroup(data)

    }

    



}