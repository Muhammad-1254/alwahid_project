import { relations } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  primaryKey,
  SQLiteBoolean,
} from "drizzle-orm/sqlite-core";

// user schema
export const User = sqliteTable("users", {
  id: text("id").primaryKey(),
  bio: text("bio"),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  avatarUrl: text("avatarUrl"),
  isSpecialUser: integer("isSpecialUser").notNull().default(0),
  userRole:text("userRole").notNull().default("normal"),
});

export const UserRelations = relations(User, ({ one, many }) => ({
  chat: one(Chat),
  messages: many(Message),
groups: many(Group),
}));

// chat schema
export const Chat = sqliteTable("chats", {
  id: text("id").primaryKey(),

  userId: text("userId")
    .references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
});

export const ChatRelations = relations(Chat, ({ one ,many}) => ({
  user: one(User, { fields: [Chat.userId], references: [User.id] }),
    messages: many(Message),
}));

export const Group = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatarUrl"),
});

export const GroupRelations = relations(Group, ({ one, many }) => ({
    users:many(User),
    messages: many(Message),
}))

// userGroupAssociation schema => many to many relationship between user and group
export const UserGroupAssociation = sqliteTable("user_group_association", {
  userId: text("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade",onUpdate:'cascade' }),
  groupId: text("groupId")
    .notNull()
    .references(() => Group.id, { onDelete: "cascade",onUpdate:'cascade' }),
},(table)=>({
  compositePk: primaryKey({columns:[table.userId, table.groupId]})
}));

export const UserGroupAssociationRelations = relations(UserGroupAssociation, ({ one }) => ({
  user: one(User, { fields: [UserGroupAssociation.userId], references: [User.id] }),
  group: one(Group, { fields: [UserGroupAssociation.groupId], references: [Group.id] }),
}));

// message schema
export const Message = sqliteTable("messages", {
  id: text("id").primaryKey(),
  textContent: text("textContent"),
  mediaContent: text("mediaContent"),
  mediaType: text("mediaType"),

  ownerId: text("ownerId").notNull().references(()=>User.id,{onDelete: "no action", onUpdate:'cascade'}),

  chatId: text("chatId").references(()=>Chat.id,{onDelete: "cascade", onUpdate:'cascade'}),
  groupId: text("groupId").references(()=>Group.id, {onDelete: "cascade", onUpdate:'cascade'}),

  sentAt: integer("sentAt").notNull(),
  deliveredAt: integer("deliveredAt"),
  readAt: integer("readAt"),
});

export const MessageRelations = relations(Message, ({ one }) => ({
  user: one(User, {
    fields: [Message.ownerId],
    references: [User.id],
  }),
    group: one(Group,{
        fields:[Message.groupId],
        references:[Group.id],
    }),
    chat: one(Chat,{
        fields:[Message.chatId],
        references:[Chat.id],
    }),

}));
