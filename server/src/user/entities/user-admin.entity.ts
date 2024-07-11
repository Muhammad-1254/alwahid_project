import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { CreatorUser } from "./user-creator.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("admin_users")
export class AdminUser {
  constructor(adminUser: Partial<AdminUser>) {
    Object.assign(this, adminUser);
  }

  @Column({ primary: true, foreignKeyConstraintName: "users.id", type: "uuid" })
  user_id: string;

  @OneToMany(() => CreatorUser, creatorUser => creatorUser.user_id,{
    cascade:true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  // @JoinColumn({name:'user_id'})
  authorized_creators: string[];

  @OneToOne(() => User, user => user.admin_user,{
    cascade:true,
    eager:true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({name:'user_id'})
  user: User;

  @OneToMany(()=>Post,post=>post.creator_user)
  posts:Post[]

}
