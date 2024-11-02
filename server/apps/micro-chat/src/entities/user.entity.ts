import { ParentEntity } from "@app/shared";
import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { UserGroupsAssociation } from "./user-group-association.entity";
import { UserChatAssociation } from "./user-chat-association.entity";
import { Chat } from "./chat.entity";
import { Group } from "./group.entity";
import { Message } from "./message.entity";


@Entity('users')
export class User extends ParentEntity<User>{
    @Column({type:'uuid', primary:true})
    userId:string    


    @OneToMany(()=>Message,message=>message.user)
    messages:Message[]

    @Column({type:'text', nullable:true})
    publicKey:string
    
  
    @OneToMany(()=>UserChatAssociation, userChatAssociation=>userChatAssociation.chat)
    chats:Chat[]
  
    @OneToMany(()=>UserGroupsAssociation, userGroupsAssociation=>userGroupsAssociation.group)
    groups:Group[]
}