import { ParentEntity } from "@app/shared/utils/parent-entity.utils";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity("userBlockAssociation")
export class UserBlockAssociation extends ParentEntity<UserBlockAssociation>{
    
    @Column({ primary: true, type: "uuid" })
    userId:string

    @Column({ primary: true, type: "uuid" })
    blockedUserId:string

    @Column({ type: "text" })
    reason: string;

    @Column({ type: "text" })
    description: string;

    @ManyToOne(()=>User, user=>user.blockedFromUsers,{
        cascade:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"blockedUserId"},)
    blockedToUsers:User
    
    @ManyToOne(()=>User, user=>user.blockedToUsers,{
        cascade:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"userId"})
    blockedFromUsers:User
    
}