import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity("user_block_association")
export class UserBlockAssociation extends ParentEntity<UserBlockAssociation>{
    
    @Column({ primary: true, type: "uuid" })
    user_id:string

    @Column({ primary: true, type: "uuid" })
    blocked_user_id:string

    @Column({ type: "text" })
    reason: string;

    @Column({ type: "text" })
    description: string;

    @ManyToOne(()=>User, user=>user.blocked_from_users,{
        cascade:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"blocked_user_id"},)
    blocked_to_users:User
    
    @ManyToOne(()=>User, user=>user.blocked_to_users,{
        cascade:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"user_id"})
    blocked_from_users:User
    
}