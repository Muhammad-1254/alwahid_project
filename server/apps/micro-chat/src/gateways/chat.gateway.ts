import { Inject, Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
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
import { AuthenticatedSocket } from "../interfaces/chat.interface";
import { RedisCacheService } from "@app/shared/services/redis-cache.service";
import { ChatService } from "../services/chat.service";
import {
  CreateGroupMessageDto,
  CreatePersonalChatDto,
  CreatePersonalMessageDto,
  IsTypingDto,
  MessageDeliveredDto,
  MessageSeenDto,
} from "../dtos/chat-create.dto";
import {
  MessageEventEnums,
  MessageStatusEnum,
  MessageSubscriptionsEnum,
} from "../enums/message-events.enum";
import { v4 as uuid } from "uuid";

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  // pingInterval: 10000,
  // pingTimeout: 15000,
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

  async handleDisconnect(socket: AuthenticatedSocket, ...args: any[]) {
    console.log("handleDisconnect");
    // imp note: socket may have not user data if user if jwt expired
    if (socket?.data && socket?.data?.user) {
      await this.chatService.removeUserSocket(socket.data.user.userId);
      this.server.to(socket.id).emit(MessageEventEnums.TOKEN_UNAUTHORIZED, {
        status: MessageStatusEnum.UNAUTHORIZED,
      });
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
    const res = await firstValueFrom(ob$).catch(e => {
      console.log("error while receiving response from auth service", e);
      if (e.statusCode === 401)
      {
        this.server.to(socket.id)
        .emit(MessageEventEnums.TOKEN_UNAUTHORIZED, {
          status: MessageStatusEnum.UNAUTHORIZED,
        });
        console.log("sending unauthorized event");
        return this.handleDisconnect(socket);
      }

    });

    if (!res) {
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
    this.server.to(socket.id).emit(MessageEventEnums.CONNECTED, {
      status: MessageStatusEnum.CONNECTED,
    });
    console.log("socket.data.user: ", socket?.data?.user);
  }

  async getUnreadMessages(socket: AuthenticatedSocket) {
    const messages = await this.chatService.getUnreadMessages(socket.data.user);
    this.server.to(socket.id).emit(MessageEventEnums.MESSAGE_GET, messages);
  }

  @SubscribeMessage(MessageSubscriptionsEnum.CREATE_CHAT)
  async createPersonalChat(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() createChat: CreatePersonalChatDto,
  ) {
    // get or create personal chat
    const chat = await this.chatService.createPersonalChat(
      socket.data.user,
      createChat,
    );

    this.server.to(socket.id).emit(MessageEventEnums.CREATE_CHAT, {
      status: MessageStatusEnum.OK,
      data: chat,
    });
  }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_SEND)
  async sendPersonalMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() createMessage: CreatePersonalMessageDto,
  ) {
    console.log("createMessage: ", createMessage);

    // save message into db
    const message = await this.chatService.savePersonalMessage(
      socket.data.user,
      createMessage,
    );
    // first check friend is online or not
    const friendSocketId = await this.chatService.getUserSocket(
      createMessage.friendId,
    );

    if (friendSocketId) {
      this.server
        .to(friendSocketId.socketId)
        .emit(MessageEventEnums.MESSAGE_GET, {
          status: MessageStatusEnum.OK,
          data: message,
        });
      this.server.to(socket.id).emit(MessageEventEnums.MESSAGE_DELIVERED, {
        status: MessageStatusEnum.OK,
        data: { id: message.id },
      });
    }
  }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_TYPING)
  async handleTypingStart(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() isTypingDto: IsTypingDto,
  ) {
    const friendSocketId = await this.chatService.getUserSocket(
      isTypingDto.friendId,
    );
    if (friendSocketId) {
      this.server
        .to(friendSocketId?.socketId)
        .emit(MessageEventEnums.MESSAGE_TYPING, {
          status: MessageStatusEnum.OK,
          data: { isTyping: isTypingDto.isTyping },
        });
    }
  }
  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_DELIVERED)
  async handleDeliveredMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() messageDeliveredDto: MessageDeliveredDto,
  ) {
    // update message delivered status in db
    await this.chatService.updateMessageDelivered(
      socket.data.user,
      messageDeliveredDto,
    );
    // send message delivered status to friend
    const friendSocketId = await this.chatService.getUserSocket(
      messageDeliveredDto.friendId,
    );
    if (friendSocketId) {
      this.server
        .to(friendSocketId.socketId)
        .emit(MessageEventEnums.MESSAGE_DELIVERED, {
          status: MessageStatusEnum.OK,
          data: {
            chatId: messageDeliveredDto.chatId,
            messageIds: messageDeliveredDto.messageIds,
          },
        });
    }
  }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_SEEN)
  // TODO: add functionality for automatically remove message from db after some hours if user get messages
  async handleSeenMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() messageSeenDto: MessageSeenDto,
  ) {
    //  update message seen status in db
    await this.chatService.updateMessageSeen(socket.data.user, messageSeenDto);

    // check if user is online then send message seen status to friend
    const friendSocketId = await this.chatService.getUserSocket(
      messageSeenDto.friendId,
    );
    if (friendSocketId) {
      this.server
        .to(friendSocketId.socketId)
        .emit(MessageEventEnums.MESSAGE_SEEN, {
          status: MessageStatusEnum.OK,
          data: {
            chatId: messageSeenDto.chatId,
            messageIds: messageSeenDto.messageIds,
          },
        });
    }
  }

  @SubscribeMessage("sendGroupMessage")
  async sendGroupMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() createChat: CreateGroupMessageDto,
  ) {
    // first save message in db
    // const message = await this.chatService.saveGroupMessage(socket.data.user,createChat);

    // now send message to all group members that are online
    const groupMembersSocketId = await this.chatService.groupMembersSocketId(
      createChat.groupId,
    );
    groupMembersSocketId.forEach(member => {
      // this.server.to(member.socketId).emit(MessageEventEnums.RECEIVED_PERSONAL_MESSAGE,{status:MessageStatusEnum.RECEIVED,data:message});
    });
  }

  @SubscribeMessage("ping")
  async ping(socket: Socket) {
    console.log("Keep socket connection alive!");
  }

  @SubscribeMessage("temp-get-uuid")
  async tempGetUUID(socket: AuthenticatedSocket) {
    this.server.to(socket.id).emit("temp-get-uuid", uuid());
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
