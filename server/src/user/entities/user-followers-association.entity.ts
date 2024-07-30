import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity("userFollowingAssociation")
export class UserFollowingAssociation extends ParentEntity<UserFollowingAssociation>{
    
    @Column({ primary: true, type: "uuid" })
    userId:string

    @Column({ primary: true, type: "uuid" })
    followingId:string


    @ManyToOne(() => User, user => user.following, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => User, user => user.followers, { onDelete: "CASCADE" })
    @JoinColumn({ name: "followingId" })
    following: User;
    
}