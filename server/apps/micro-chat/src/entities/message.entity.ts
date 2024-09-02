

import { ParentEntity } from "@app/shared";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Chat } from "./chat.entity";
import { User } from "./user.entity";
import { Group } from "./group.entity";


@Entity("messages")
export class Message {
    constructor(partial: Partial<Message>) {
        Object.assign(this, partial);
      }

    @Column({type:'uuid', primary:true, })
    id:string
    
    @Column({type:'text', nullable:true})
    content:string


    @Column({type:'text',})
    mimeType:string

    
    @CreateDateColumn()
    sentAt:Date

    @Column({type:'timestamptz', nullable:true})
    deliveredAt:Date

    @Column({type:'timestamptz',nullable:true})
    seenAt:Date

    @Column({type:'uuid',})
    userId:string
    @ManyToOne(()=>User,user=>user.messages, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'userId'})
    user:User


    @Column({type:'uuid',nullable:true})
    groupId:string
    @ManyToOne(()=>Group,group=>group.messages, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'groupId'})
    group:Group

    @Column({type:'uuid',nullable:true})
    chatId:string
    @ManyToOne(()=>Chat,chat=>chat.messages, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'chatId'})
    chat:Chat

    
}