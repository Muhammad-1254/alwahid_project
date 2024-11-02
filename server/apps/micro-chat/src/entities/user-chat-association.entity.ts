import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Chat } from "./chat.entity";
import { ParentEntity } from "@app/shared";



@Entity('user_chat_association')
export class UserChatAssociation extends ParentEntity<UserChatAssociation>{

    @Column({primary:true, type:'uuid'})
    userId:string

    @Column({primary:true, type:'uuid'})
    chatId:string


    @ManyToOne(()=>User,user=>user.chats,{onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'userId'})
    user:User

    @ManyToOne(()=>Chat,chat=>chat.users, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'chatId'})
    chat:Chat
    
}
