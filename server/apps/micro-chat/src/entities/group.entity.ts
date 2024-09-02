import { BeforeInsert, BeforeUpdate, Check, Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { UserGroupsAssociation } from "./user-group-association.entity";
import { Message } from "./message.entity";
import { ParentEntity } from "@app/shared";

@Entity('groups')
export class Group extends ParentEntity<Group>{
    @Column({type:'uuid', primary:true, })
    id:string

    

    @Column({type:'text', })
    name:string

    @Column({type:'text', nullable:true})
    description:string

    @Column({type:'text', nullable:true})
    avatarUrl:string

    
    
  @Column({ type: "uuid", array: true })
  groupAdmins: string[];

    @ManyToOne(()=>Message,message=>message.group)
    messages:Message[]

    @OneToMany(()=>UserGroupsAssociation, userGroupsAssociation=>userGroupsAssociation.user)
    users:UserGroupsAssociation[]

}