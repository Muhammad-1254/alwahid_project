import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { QualificationEnum } from "src/lib/types/user";
import { Location } from "src/location/entities/location.entity";
import { AdminUser } from "./user-admin.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("creatorUsers")
export class CreatorUser {
  constructor(creatorUser: Partial<CreatorUser>) {
    Object.assign(this, creatorUser);
  }
  @Column({ primary: true, foreignKeyConstraintName: "users.id", type: "uuid" })
  userId: string;

  @Column({ nullable: true, type: "date" })
  authorizedAt: Date;

  @Column({ type: "text" })
  worksOn: string;

  @Column({ nullable: false, type: "enum", enum: QualificationEnum })
  qualification: QualificationEnum;

  @OneToOne(() => User, user => user.creatorUser, {
    cascade:true,
    eager:true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({name:'userId'})
  user: User;

  @OneToMany(()=>Post,post=>post.creatorUser)
  posts:Post[]

  @OneToOne(() => Location, Location => Location.creatorWorkLocation,)
  workLocation: Location;

  @Column({type:'uuid',})
  authorizedAdminId:string;
  
  @ManyToOne(() => AdminUser, adminUser => adminUser.authorizedCreators,{
    onDelete:"SET NULL",
    onUpdate:"CASCADE",
  })
  @JoinColumn({name:'authorizedAdminId'})
  authorizedAdmin: AdminUser;
}
