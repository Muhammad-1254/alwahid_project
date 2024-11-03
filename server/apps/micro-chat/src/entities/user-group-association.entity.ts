import { ParentEntity } from "@app/shared";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";


@Entity('user_groups_association')
export class UserGroupsAssociation extends ParentEntity<UserGroupsAssociation> {
    
    @Column({type:'uuid', primary:true, })
    userId:string

    @Column({type:'uuid', primary:true, })
    groupId:string

    @ManyToOne(()=>User,user=>user.groups,{onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'userId'})
    user:User

    @ManyToOne(()=>Group,group=>group.users, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'groupId'})
    group:Group
    
 
    
}