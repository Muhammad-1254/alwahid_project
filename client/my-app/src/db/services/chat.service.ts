import { asc, desc, eq, sql } from "drizzle-orm";
import * as schema from "@/src/db/schema/chatSchema";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

const { Chat, Group, Message, User, UserGroupAssociation } = schema;
export const chatService = {
  getChatScreenData,
  getChatUserInformation,
  getUserChatMessages,
  getUserGroupMessages,
  insertUserChatMessage,
  insertUserGroupMessage,
  deleteUserChatMessage,
};
async function getChatScreenData(db: ExpoSQLiteDatabase<typeof schema>) {
  const chatsWithLastMessage = await db
    .select({
      id: Chat.id,
      chatType: sql`'CHAT'`.as("chatType"),
      userId: Chat.userId,

      lastMessageText: Message.textContent,
      lastMessageMedia: Message.mediaContent,
      lastMessageMediaType: Message.mediaType,
      lastMessageSentAt: Message.sentAt,
      
      firstname: User.firstname,
      lastname: User.lastname,
      avatarUrl: User.avatarUrl,
      isSpecialUser: User.isSpecialUser,
    })
    .from(Chat)
    .leftJoin(Message, eq(Message.chatId, Chat.id))
    .leftJoin(User, eq(User.id, Chat.userId))
    .orderBy(desc(Message.sentAt))
    .limit(1)
    .groupBy(Chat.id);
    
  const groupsWithLastMessage = await db
    .select({
      id: Group.id,
      name: Group.name,
      avatarUrl: Group.avatarUrl,

      chatType: sql`'GROUP'`.as("chatType"),
      
      lastMessageText: Message.textContent,
      lastMessageMedia: Message.mediaContent,
      lastMessageMediaType: Message.mediaType,
      lastMessageSentAt: Message.sentAt,
    })
    .from(Group)
    .leftJoin(Message, eq(Message.groupId, Group.id))
    .orderBy(desc(Message.sentAt))
    .limit(1)
    .groupBy(Group.id);
    const combineData = [...chatsWithLastMessage, ...groupsWithLastMessage]
  return combineData
}
async function getChatUserInformation(
  params:{ db: ExpoSQLiteDatabase<typeof schema>,
    chatId: string,
  },
){
  const {chatId,db} = params;
  const chat = await db
  .select({
    userId: Chat.userId,
  })
  .from(Chat)
  .where(eq(Chat.id, chatId))

  if(chat.length>0){
    const user = await db
    .select()
    .from(User)
    .where(eq(User.id, chat[0].userId)) 
    return user
  }

}


async function getUserChatMessages(
 params:{ db: ExpoSQLiteDatabase<typeof schema>,
  chatId: string,
  offset: number,
  limit: number}
) {
  const { db, chatId, offset, limit } = params;
  const res = await db
    .select()
    .from(Message)
    .where(eq(Message.chatId, chatId))
    .orderBy(asc(Message.sentAt))
    .offset(offset)
    .limit(limit);
    return res
}

async function getUserGroupMessages(
  params:{

  db: ExpoSQLiteDatabase<typeof schema>,
  groupId: string,
  offset: number,
  limit: number
}
) {
  const { db, groupId, offset, limit } = params;
  const res = await db
    .select()
    .from(Message)
    .where(eq(Message.groupId, groupId))
    .orderBy(desc(Message.sentAt))
    .offset(offset)
    .limit(limit);
    return res
}

async function insertUserChatMessage(
 params: { db: ExpoSQLiteDatabase<typeof schema>,
  data: InsertUserChatMessageType}
) {
  const { db, data } = params;
  return await db
    .insert(Message)
    //   @ts-ignore
    .values({
      id: data.id,
      textContent: data.textContent,
      mediaContent: data.mediaContent,
      mediaType: data.mediaType,

      ownerId: data.ownerId,

      chatId: data.chatId,
      sentAt: data.sentAt,
    });
}

async function insertUserGroupMessage(
  db: ExpoSQLiteDatabase<typeof schema>,
  data: InsertUserGroupMessageType
) {
  return await db
    .insert(Message)
    //   @ts-ignore
    .values({
      id: data.id,
      textContent: data.textContent,
      mediaContent: data.mediaContent,
      mediaType: data.mediaType,

      ownerId: data.ownerId,

      groupId: data.groupId,

      sentAt: data.sentAt,
    });
}

async function deleteUserChatMessage(
  db: ExpoSQLiteDatabase<typeof schema>,
  messageId: string
) {
  return await db.delete(Message).where(eq(Message.id, messageId));
}

export type UserChatInformationType={
  id: string;
  avatarUrl: string;
  bio: string;
  firstname: string;
  lastname: string;
  isSpecialUser: number;
}

export type ChatsWithLastMessageType={
  id: string;
  chatType: unknown;
  userId: string;
  lastMessageText: string;
  lastMessageMedia: string;
  lastMessageMediaType: string;
  lastMessageSentAt: string;
  firstname: string;
  lastname: string;
  avatarUrl: string;
  isSpecialUser: number;
}
export type GroupsWithLastMessageType= {
  id: string;
  name: string;
  avatarUrl: string;
  chatType: unknown;
  lastMessageText: string;
  lastMessageMedia: string;
  lastMessageMediaType: string;
  lastMessageSentAt: string;
}

export type ChatScreenDataType=ChatsWithLastMessageType|GroupsWithLastMessageType;

export type MessageScreenDataType = {
  id: string
  textContent?: string;
  mediaContent?: string;
  mediaType?: string;
  ownerId: string;
  chatId?: string;
  groupId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  isSent?: number;
}


export type InsertUserGroupMessageType = {
  id:string
  groupId: string;
  ownerId: string;
  textContent?: string;
  mediaContent?: string;
  mediaType?: string;
  sentAt: string;
};

export type InsertUserChatMessageType = {
  id:string
  chatId: string;
  ownerId: string;
  textContent?: string;
  mediaContent?: string;
  mediaType?: string;
  sentAt: string;

};

export type DeleteUserMessage = {
  messageId: string;
  chatId?: string;
  groupId?: string;
};

