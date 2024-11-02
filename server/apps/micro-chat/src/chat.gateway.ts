import { Inject, Injectable } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { Socket } from "dgram";
import { ClientProxy } from "@nestjs/microservices";
import { JwtAuthGuardTrueType, MicroservicesNames } from "@app/shared";
import { firstValueFrom } from "rxjs";
import { timeStamp } from "console";
import { AuthenticatedSocket } from "./chat.interface";
import { RedisCacheService } from "@app/shared/services/redis-cache.service";
import { ChatService } from "./chat.service";
import {

  CreateGroupMessageDto,
  CreatePersonalChatDto,
  CreatePersonalMessageDto,
} from "./dtos/chat-create.dto";
import {
  MessageEventEnums,
  MessageStatusEnum,
} from "./enums/message-events.enum";
@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(MicroservicesNames.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    @Inject(MicroservicesNames.USER_SERVICE)
    private readonly userService: ClientProxy,
    private readonly cache: RedisCacheService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(socket: AuthenticatedSocket) {
    console.log("handleDisconnect");
    // imp note: socket may have not user data if user if jwt expired
    if(socket.data?.user){
      await this.chatService.removeUserSocket(socket.data.user.userId)
      this.server.to(socket.id).emit(MessageEventEnums.UNAUTHORIZED, {status:MessageStatusEnum.UNAUTHORIZED});
    }
    socket.disconnect();
  }

  async handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log("Incoming Connection");
    const token = socket.handshake.headers.authorization ?? null;
    if (!token) {
      console.log("No token found");
      await this.handleDisconnect(socket);
      return;
    }
    const jwt = token.split(" ")[1];
    const ob$ = this.authService.send({ cmd: "verifyJwtToken" }, { jwt });
    const res = await firstValueFrom(ob$).catch(e =>
      console.log("error while receiving response from auth service", e),
    );

    if (!res?.email) {
      console.log("Invalid JWT token:", res);
      this.handleDisconnect(socket);
      return;
    }
    const userJwt: JwtAuthGuardTrueType = res;
    socket.data.user = userJwt;


    // find user in chat db
    const user = await this.chatService.getUserFromDb(userJwt.userId);

    // if user not found in chat db, then disconnect the socket
    if (!user) {
      console.log("User not found in chat db");
      await this.handleDisconnect(socket);
      return;
    }

    await this.chatService.setUserSocket(userJwt.userId, socket.id);
    // now checking if user is not this means that user have not previous chats
      // await this.getUnreadMessages(socket) 
    this.server
      .to(socket.id)
      .emit(MessageEventEnums.CONNECTED, {
        status: MessageStatusEnum.CONNECTED,
      });
  }

  @SubscribeMessage("isUserOnChatSection")
  async isUserOnChatSection(socket: AuthenticatedSocket, userId: string) {
    const user = await this.chatService.getUserFromDb(userId);
    if (!user) {
      this.server.to(socket.id).emit(MessageEventEnums.NEW_USER, {
        status: MessageStatusEnum.OK,
        message: "User not found",
      });
      this.handleDisconnect(socket);
      return;
    }
    const socketId = await this.chatService.getUserSocket(userId);
    if (!socketId) {
      this.server.to(socket.id).emit(MessageEventEnums.BAD_REQUEST, {
        status: MessageStatusEnum.BAD_REQUEST,
        message: "User not online",
      });
      return;
    }
    this.server.to(socket.id).emit(MessageEventEnums.OK_SIGNAL, {
      status: MessageStatusEnum.OK,
      data: { isOnline: true },
    });
  }

  @SubscribeMessage('getUnreadMessages')
  async getUnreadMessages(socket:AuthenticatedSocket){
    const messages = await this.chatService.getUnreadMessages(socket.data.user)
    this.server.to(socket.id).emit(MessageEventEnums.RECEIVED_PERSONAL_MESSAGE,messages)
  }
  @SubscribeMessage("createPersonalChat")
  async createPersonalChat(socket:AuthenticatedSocket, createChat:CreatePersonalChatDto){
    
    if(typeof createChat ==='string'){
      console.log("createChat is string")
      createChat = JSON.parse(createChat);
    }
    const chat = await this.chatService.createPersonalChat(socket.data.user,createChat);
    this.server.to(socket.id).emit(MessageEventEnums.OK_SIGNAL,{status:MessageStatusEnum.OK,data:chat});  
  }
  

  @SubscribeMessage("sendPersonalMessage")
  async sendPersonalMessage(
    socket: AuthenticatedSocket,
    createMessage: CreatePersonalMessageDto,
  ) {
    if(typeof createMessage === 'string'){
      createMessage = JSON.parse(createMessage);
    }
    // first check friend is online or not
    const friendSocketId = await this.chatService.getUserSocket(createMessage.friendId); 
    console.log({friendSocketId})
    
    if(friendSocketId){
      this.server.to(friendSocketId?.socketId).emit(MessageEventEnums.RECEIVED_PERSONAL_MESSAGE,{status:MessageStatusEnum.RECEIVED,data:createMessage});
      return
    }
    // now check friend is in db or not
    const friendExist = await this.chatService.getUserFromDb(
      createMessage.friendId,
    );
    if (!friendExist) {
      this.server
        .to(socket.id)
        .emit(MessageEventEnums.BAD_REQUEST, {
          status: MessageStatusEnum.BAD_REQUEST,
          message: "Friend not joined chat yet",
        });
    }
    // now check friend is online or not
    console.log({createMessage})
   
    // if friend is offline, save message in db
    const message = await this.chatService.savePersonalMessage(socket.data.user,createMessage);
    console.log("adding new chat to db")
    this.server.to(socket.id).emit(MessageEventEnums.OK_SIGNAL,{status:MessageStatusEnum.OK});
  }


  @SubscribeMessage("sendGroupMessage")
  async sendGroupMessage(
    socket: AuthenticatedSocket,
    createChat: CreateGroupMessageDto,
  ) {
    // first save message in db
    // const message = await this.chatService.saveGroupMessage(socket.data.user,createChat);

    // now send message to all group members that are online
    const groupMembersSocketId = await this.chatService.groupMembersSocketId(createChat.groupId);
    groupMembersSocketId.forEach(member=>{
      // this.server.to(member.socketId).emit(MessageEventEnums.RECEIVED_PERSONAL_MESSAGE,{status:MessageStatusEnum.RECEIVED,data:message});
    })
  }

  @SubscribeMessage("ping")
  async ping(socket: Socket) {
    console.log("Keep socket connection alive!");
  }



  // @SubscribeMessage('startCall')
  // async startCall(socket: Socket, callDetails: CallDetailsDTO) {
  //   const { user } = socket.data;

  //   if (!user || !callDetails) return;

  //   const friendDetails = await this.getFriendDetails(callDetails.friendId);

  //   if (!friendDetails) return;

  //   const userCallDetails = {
  //     meetingId: callDetails.meetingId,
  //     friendId: user.id,
  //   };

  //   this.server.to(friendDetails.socketId).emit('receiveCall', userCallDetails);
  // }

  // @SubscribeMessage('declineCall')
  // async declineCall(socket: Socket, friendId: number) {
  //   const friendDetails = await this.getFriendDetails(friendId);

  //   this.server.to(friendDetails.socketId).emit('callResponse', {
  //     status: 'DECLINED',
  //   });
  // }

  // @SubscribeMessage('acceptCall')
  // async acceptCall(socket: Socket, friendId: number) {
  //   const friendDetails = await this.getFriendDetails(friendId);

  //   this.server.to(friendDetails.socketId).emit('callResponse', {
  //     status: 'ACCEPTED',
  //   });
  // }
}
