import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AuthenticatedSocket } from "./chat.interface";
import { JwtAuthGuardTrueType, MicroservicesNames } from "@app/shared";
import { ClientProxy } from "@nestjs/microservices";
import { RedisCacheService } from "@app/shared/services/redis-cache.service";
import { firstValueFrom } from "rxjs";
import {
  CreateGroupMessageDto,
  CreatePersonalChatDto,
  CreatePersonalMessageDto,
} from "./dtos/chat-create.dto";
import { EntityManager, In, Raw } from "typeorm";

import { v4 as uuid } from "uuid";
import { Chat, Group,  Message, User, UserChatAssociation, UserGroupsAssociation } from "./entities";
import { ChatTargetTypeEnum } from "./enums/entities.enum";
import { CacheSaveType } from "./types/socket.type";
import { User as MainUser } from "@app/shared/entities";
import { WsException } from "@nestjs/websockets";
import { MessageStatusEnum } from "./enums/message-events.enum";
import { AddUserInChatGroupPayloadType, CreateChatGroupPayloadType, CreateNewUserInChatSectionPayloadType, LeaveChatGroupPayloadType, UpdateChatGroupPayloadType } from "./types/chat-payload.type";
import { CustomRpcExceptions } from "@app/shared/filters/CustomRpcExceptions.filter";
@Injectable()
export class ChatService {
  constructor(
    @Inject(MicroservicesNames.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    @Inject(MicroservicesNames.USER_SERVICE)
    private readonly userService: ClientProxy,
    private readonly cache: RedisCacheService,
    private readonly entityManager: EntityManager,
  ) {}

  async setUserSocket(userId: string, socketId:string) {
    await this.cache.set(`micro-chat-${userId}`, {userId,socketId});
  }
  async getUserSocket(userId: string) {
    const userDetails: CacheSaveType | any = await this.cache.get(`micro-chat-${userId}`);
    console.log("userDetails", userDetails);
    return userDetails;
  }
  async removeUserSocket(userId:string){
    await this.cache.del(`micro-chat-${userId}`)
  }

  
  async getUserFromDb(userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { userId, },
      loadEagerRelations:false,
    });
    return user;
  }
  async getUserFromMainDb(userId: string) {
    const ob$ = this.userService.send({ cmd: "get-unsecure-user" }, { userId });
    const user: MainUser = await firstValueFrom(ob$).catch(e =>
      console.log("error while receiving response from user service", e),
    );
    return user;
  }
 
  async createUserInChatDb(userJwt:JwtAuthGuardTrueType){
    const user = new User({
      userId:userJwt.userId,
    })
    await this.entityManager.save(user);
    return user;
  }
 
async createPersonalChat(user:JwtAuthGuardTrueType, createChat:CreatePersonalChatDto){
  // find user and friend chat association with same chatId i.e have to find
  const userChats = await this.entityManager.find(UserChatAssociation,{
    where:{userId:user.userId,},
    relations:['chat']
  }) 
  const friendChats = await this.entityManager.find(UserChatAssociation,{
    where:{userId:createChat.friendId,},
    relations:['chat']
  }) 
  // now find common chat
  const commonChat = userChats.find(userChat=>friendChats.find(friendChat=>friendChat.chat.id===userChat.chat.id))
  console.log({commonChat})
  // if common chat found then return chat
  if(commonChat){
    return {chatId:commonChat.chat.id}
  }
  // if record found then return chat
  // else create new chat and userChat

  // if chat now exist then create new chat
  const newChatId  = uuid()
  const chat = new Chat({
    id:newChatId,
  })
  // for current user
  const userChatAssociation = new UserChatAssociation({
    userId:user.userId,
    chatId:newChatId
  })
  // for friend user
  const friendChatAssociation = new UserChatAssociation({
    userId:createChat.friendId,
    chatId:newChatId
  })
  await this.entityManager.transaction(async tEM=>{
    await tEM.save([chat,userChatAssociation,friendChatAssociation]);
  })
  return {chatId:chat.id};
}

async getUnreadMessages(user:JwtAuthGuardTrueType){

  // first get all personal chats
  const personalChats =await this.entityManager.createQueryBuilder(UserChatAssociation, "userChatAssociation")
  .leftJoinAndSelect("userChatAssociation.chat","chat")
  .leftJoinAndSelect("chat.messages","message",)
  .where("userChatAssociation.userId = :userId",{userId:user.userId})
  .getMany()
  console.log({personalChats})

  // now get all group chats
  const groupChats = await this.entityManager.createQueryBuilder(UserGroupsAssociation, "userGroupsAssociation")
  .leftJoinAndSelect("userGroupsAssociation.group","group")
  .leftJoinAndSelect("group.messages","message")
  .where("userGroupsAssociation.userId = :userId",{userId:user.userId})
  .getMany()
  console.log({groupChats})
return {personalChats,groupChats}
 
}

  async savePersonalMessage(user:JwtAuthGuardTrueType, createMessage:CreatePersonalMessageDto){
    
    // first check textContent and medias are not empty
    if(!createMessage.content && !createMessage.mimeType ){
      throw new WsException({status:MessageStatusEnum.BAD_REQUEST,message:"Text content or media is required"});
    }
    const message = new Message({
      id:uuid(),
      userId:user.userId,
      chatId:createMessage.chatId,
      mimeType:createMessage.mimeType,
      content:createMessage.content,   
    })
    await this.entityManager.save(message);
    return message
  }
  // async saveGroupMessage(user:JwtAuthGuardTrueType, createMessage:CreateGroupMessageDto){
  //   // first check textContent and medias are not empty
  //   if(!createMessage. && !createMessage.medias){
  //     throw new WsException({status:MessageStatusEnum.BAD_REQUEST,message:"Text content or media is required"});
  //   }
  //   let medias:Media[]|null = null;
  //   // now check if media available then create media
  //   if(createMessage.medias){
  //     medias = createMessage.medias.map(media=>{
  //       return new Media({
  //         id:uuid(),
  //         url:media.urlKey,
  //         mimeType:media.mimeType,
  //       })
  //     })
  //   }
  //   const message = new Message({
  //     id:uuid(),
  //     userId:user.userId,
  //     groupId:createMessage.groupId,
  //     targetType:ChatTargetTypeEnum.PERSONAL,
  //     content:createMessage.textContent,   
  //     medias
  //   })
  //   await this.entityManager.save(message);
  //   return message
  // }


  async groupMembersSocketId(groupId:string){
    const userGroupsAssociation = await this.entityManager.find(UserGroupsAssociation,{
      where:{groupId},
      loadEagerRelations:false,
      relations:['user']
    });
    const groupMembersSocketId:CacheSaveType[] =[]
    for(let i=0;i<userGroupsAssociation.length;i++){
      const cacheUser: CacheSaveType|any= await this.cache.get(`micro-chat-${userGroupsAssociation[i].userId}`);
      if(cacheUser?.socketId){
        groupMembersSocketId.push(cacheUser)
        }
    }
    return groupMembersSocketId
  }

  /////////////////////////////////// chat controller services/////////////////////////// 
  async createNewUserInChatSection(data_:CreateNewUserInChatSectionPayloadType){
    const {createNewUserInChatSectionDto,user} = data_
    // first check user in db or not
    const userExist = await this.entityManager.findOne(User, {
      where: { userId: user.userId },
    })
    if(userExist){
      throw CustomRpcExceptions.BadRequestException("user already exist in chat database")
    }
    const newUser = new User({
      userId:user.userId,
      publicKey:createNewUserInChatSectionDto.publicKey,
    })
  }
  async createChatGroup(data_:CreateChatGroupPayloadType){
    const {createChatGroupDto:createGroup,user} =data_
    // first check user in db or not
    const userExist = await this.entityManager.findOne(User,{
      where:{
        userId:user.userId
      }
    })
    if(!userExist){
      throw CustomRpcExceptions.BadRequestException("user is not found in chat database")
    }

    // now creating new group and also userGroupAssociation of admin
    const groupId = uuid()
    const group = new Group({
      id:groupId,
      name:createGroup.groupName,
      description:createGroup.groupDescription,
      avatarUrl:createGroup.avatarUrl,
      groupAdmins:[user.userId],
    })

  const userGroupAssociation = new UserGroupsAssociation({
    userId:user.userId,
    groupId
  })
  await this.entityManager.transaction(async tEM=>{
    await tEM.save([group,userGroupAssociation])
  })
  return group
  }

  async addUserInChatGroup(data_:AddUserInChatGroupPayloadType){
    const {createAddUserInChatGroupDto:addUser,user} = data_
     // first check if group exist or not
     const groupExist = await this.entityManager.findOne(Group,{
      where:{
        id: addUser.groupId,
      },
      loadEagerRelations:false,
      select:['id','groupAdmins',]
    })
    await this.entityManager.save(groupExist)
    if(!groupExist){
      throw CustomRpcExceptions.NotFoundException("Group not found with that id")
    }
    // now check if user if group admin?
    if(!groupExist.groupAdmins.includes(user.userId)){
      throw CustomRpcExceptions.UnauthorizedException("User is not admin")
    } 
    
    // now creating user group association
    const userGroupAssociations=
    addUser.userIds.map(userId=>{
      return new UserGroupsAssociation({
        userId,
        groupId:addUser.groupId
      })
    })
  
    await this.entityManager.save(userGroupAssociations)
  }
  async updatedChatGroupInfo(data_:UpdateChatGroupPayloadType){
    const {updateChatGroupDto:updateGroup,user} = data_
    // first check if group exist or not
    const groupExist = await this.entityManager.findOne(Group,{
      where:{
        id: updateGroup.groupId
      },
      loadEagerRelations:false,
      select:['id','avatarUrl','name','description','groupAdmins']
    })
    await this.entityManager.save(groupExist)
    if(!groupExist){
      throw CustomRpcExceptions.NotFoundException("Group not found with that id")
    }
    // now check if user if group admin?
    if(!groupExist.groupAdmins.includes(user.userId)){
      throw CustomRpcExceptions.UnauthorizedException("User is not admin")
    }
    groupExist.avatarUrl = updateGroup.avatarUrl;
    groupExist.name = updateGroup.groupName;
    groupExist.description = updateGroup.groupDescription;
    console.log({groupExist})
    return groupExist
  }

  async leaveChatGroup(data_:LeaveChatGroupPayloadType){
    const {RemoveUserInChatGroupDto:removeUser,user} = data_
    // first check if group exist or not
    const groupExist = await this.entityManager.findOne(Group,{
     where:{
       id: removeUser.groupId,
     },
     loadEagerRelations:false,
     select:['id','groupAdmins',]
   })
   await this.entityManager.save(groupExist)
   if(!groupExist){
     throw CustomRpcExceptions.NotFoundException("Group not found with that id")
   }
   // now check if admin removes user
   const userGroupAssociations = await this.entityManager.find(UserGroupsAssociation,{
     where:{
       userId:In(removeUser.userIds),
       groupId:removeUser.groupId
     }
   })
   if(groupExist.groupAdmins.includes(user.userId)){
    // now delete user from UserGroupAssociation
    await this.entityManager.remove(userGroupAssociations) // TODO: check if it is working or not
    return groupExist;
    }
    if(removeUser.userIds.length===1 && removeUser.userIds[0]===user.userId){
      // now delete user from UserGroupAssociation
      await this.entityManager.remove(userGroupAssociations) // TODO: check if it is working or not
      return groupExist;
    }
    throw CustomRpcExceptions.UnauthorizedException("User is not part of group")
  }

}
