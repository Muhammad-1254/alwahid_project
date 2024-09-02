import { desc, eq, sql } from "drizzle-orm";
import * as schema from "@/src/db/schema/chatSchema";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

const { Chat, Group, Message, User, UserGroupAssociation } = schema;
export const chatService = {
  getChatScreenData,
  getUserChatMessages,
  getUserGroupMessages,
  insertUserChatMessage,
  insertUserGroupMessage,
  deleteUserChatMessage,
};
async function getChatScreenData(db: ExpoSQLiteDatabase<typeof schema>) {
  const chatsWithLastMessage = await db
    .select({
      chatId: Chat.id,
      lastMessage: sql`MAX(${Message.sentAt})`.as("latestMessage"),
      chatType: sql`'chat'`.as("chatType"),
      userId: Chat.userId,
      firstname: User.firstname,
      lastname: User.lastname,
      avatarUrl: User.avatarUrl,
      isSpecialUser: User.isSpecialUser,
      userRole: User.userRole,
    })
    .from(Chat)
    .leftJoin(Message, eq(Message.chatId, Chat.id))
    .leftJoin(User, eq(User.id, Chat.userId))
    .limit(1)
    .groupBy(Chat.id);
  const groupsWithLastMessage = await db
    .select({
      groupId: Group.id,
      name: Group.name,
      avatarUrl: Group.avatarUrl,
      lastMessage: sql`MAX(${Message.sentAt})`.as("latestMessage"),
      chatType: sql`'group'`.as("chatType"),
    })
    .from(Group)
    .leftJoin(Message, eq(Message.groupId, Group.id))
    .limit(1)
    .groupBy(Group.id);
  return { chat: chatsWithLastMessage, group: groupsWithLastMessage };
}

async function getUserChatMessages(
  db: ExpoSQLiteDatabase<typeof schema>,
  chatId: string,
  offset: number,
  limit: number
) {
  return await db
    .select({
      id: Message.id,

      textContent: Message.textContent,
      mediaContent: Message.mediaContent,
      mediaType: Message.mediaType,

      ownerId: Message.ownerId,

      chatId: Message.chatId,

      sentAt: Message.sentAt,
      deliveredAt: Message.deliveredAt,
      readAt: Message.readAt,
    })
    .from(Message)
    .where(eq(Message.chatId, chatId))
    .orderBy(desc(Message.sentAt))
    .offset(offset)
    .limit(limit);
}

async function getUserGroupMessages(
  db: ExpoSQLiteDatabase<typeof schema>,
  groupId: string,
  offset: number,
  limit: number
) {
  return await db
    .select({
      id: Message.id,

      textContent: Message.textContent,
      mediaContent: Message.mediaContent,
      mediaType: Message.mediaType,

      ownerId: Message.ownerId,

      groupId: Message.groupId,

      sentAt: Message.sentAt,
      deliveredAt: Message.deliveredAt,
      readAt: Message.readAt,
    })
    .from(Message)
    .where(eq(Message.groupId, groupId))
    .orderBy(desc(Message.sentAt))
    .offset(offset)
    .limit(limit);
}

async function insertUserChatMessage(
  db: ExpoSQLiteDatabase<typeof schema>,
  data: InsertUserChatMessageType
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

      chatId: data.chatId,

      sentAt: Date.now(),
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

      sentAt: Date.now(),
    });
}

async function deleteUserChatMessage(
  db: ExpoSQLiteDatabase<typeof schema>,
  messageId: string
) {
  return await db.delete(Message).where(eq(Message.id, messageId));
}

export type InsertUserGroupMessageType = {
  id: string;
  groupId: string;
  ownerId: string;
  textContent?: string;
  mediaContent?: string;
  mediaType?: string;
};

export type InsertUserChatMessageType = {
  id: string;
  chatId: string;
  ownerId: string;
  textContent?: string;
  mediaContent?: string;
  mediaType?: string;
};

export type DeleteUserMessage = {
  messageId: string;
  chatId?: string;
  groupId?: string;
};
