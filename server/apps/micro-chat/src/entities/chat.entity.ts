import { ParentEntity } from "@app/shared";
import {
  BeforeInsert,
  BeforeUpdate,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./message.entity";
import { UserChatAssociation } from "./user-chat-association.entity";
import { User } from "./user.entity";

@Entity("chats")
export class Chat extends ParentEntity<Chat> {
  @Column({ type: "uuid", primary: true })
  id: string;

  
  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @OneToMany(
    () => UserChatAssociation,
    userChatAssociation => userChatAssociation.user,
  )
  users: User[];
}
