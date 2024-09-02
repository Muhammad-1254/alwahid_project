import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { CreatorUser } from "./user-creator.entity";
import { Post } from "@app/shared/entities/micro-post.entities/post.entity";

@Entity("adminUsers")
export class AdminUser {
  constructor(adminUser: Partial<AdminUser>) {
    Object.assign(this, adminUser);
  }

  @Column({ primary: true, foreignKeyConstraintName: "users.id", type: "uuid" })
  userId: string;

  @OneToMany(() => CreatorUser, creatorUser => creatorUser.authorizedAdmin,)
  authorizedCreators: CreatorUser[];

  @OneToOne(() => User, user => user.adminUser,{
    cascade:true,
    eager:true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({name:'userId'})
  user: User;

  @OneToMany(()=>Post,post=>post.creatorUser)
  posts:Post[]

}
