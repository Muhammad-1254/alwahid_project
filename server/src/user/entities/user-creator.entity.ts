import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { QualificationEnum } from "src/lib/types/user";
import { Location } from "src/location/entities/location.entity";
import { AdminUser } from "./user-admin.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("creator_users")
export class CreatorUser {
  constructor(creatorUser: Partial<CreatorUser>) {
    Object.assign(this, creatorUser);
  }
  @Column({ primary: true, foreignKeyConstraintName: "users.id", type: "uuid" })
  user_id: string;

  @Column({ nullable: true, type: "date" })
  authorized_at: Date;

  @Column({ type: "text" })
  works_on: string;

  @Column({ nullable: false, type: "enum", enum: QualificationEnum })
  qualification: QualificationEnum;

  @OneToOne(() => User, user => user.creator_user, {
    cascade:true,
    eager:true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({name:'user_id'})
  user: User;

  @OneToMany(()=>Post,post=>post.creator_user)
  posts:Post[]

  @OneToOne(() => Location, Location => Location.creator_work_location,)
  work_location: Location;

  @ManyToOne(() => AdminUser, adminUser => adminUser.user_id,)
  authorized_admin_id: string;
}
