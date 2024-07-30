import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, JoinTable, ManyToMany,  OneToMany, OneToOne } from "typeorm";
import { AdminUser } from "./user-admin.entity";
import { CreatorUser } from "./user-creator.entity";
import { NormalUser } from "./user-normal.entity";
import { AuthProviderEnum, GenderEnum, UserRoleEnum } from "src/lib/types/user";
import { Location } from "src/location/entities/location.entity";
import { Post } from "src/post/entities/post.entity";
import { PostComments } from "src/post/entities/post-comment.entity";
import { UserBlockAssociation } from "./user-block-association.entity";

@Entity("users")
export class User extends ParentEntity<User> {
  @Column({ primary: true, type: "uuid" })
  id: string;

  @Column({ nullable: true, type: "varchar", unique: true })
  email: string;

  @Column({ nullable: true, type: "text" })
  password: string;

  @Column({ type: "varchar" })
  firstname: string;

  @Column({ type: "varchar" })
  lastname: string;

  @Column({ nullable: true, type: "text" })
  avatarUrl: string;

  @Column({ nullable: true, type: "int" })
  age: number;

  @Column({ nullable: true, type: "varchar" })
  phoneNumber: string;

  @Column({ type: "enum", enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: "enum", enum: UserRoleEnum })
  userRole: UserRoleEnum;

  @Column({nullable:true, type: "date" })
  dateOfBirth: Date;

  @Column({ type: "enum", enum: AuthProviderEnum })
  authProvider: AuthProviderEnum;

  @Column({ default: false, type: "boolean" })
  isVerified: boolean;

  @Column({ default: true, type: "boolean" })
  isActive: boolean;

  @Column({ nullable: true, default: false, type: "boolean" })
  isSpecialUser: boolean;

  @Column({ nullable: true, type: "date" })
  authorizedSpecialUserAt: Date;

  @Column({ nullable: true, type: "uuid" })
  authorizedSpecialUserByCreatorId: string;

  @Column({ nullable: true, type: "uuid" })
  authorizedSpecialUserByAdminId: string;

  @OneToOne(() => Location, Location => Location.userLocation)
  location: Location;

  @OneToOne(() => AdminUser, adminUser => adminUser.user)
  adminUser: AdminUser;

  @OneToOne(() => CreatorUser, creatorUser => creatorUser.user)
  creatorUser: CreatorUser;

  @OneToOne(() => NormalUser, normalUser => normalUser.user)
  normalUser: NormalUser;

  // user tagged in post relationship
  @ManyToMany(() => Post, post => post.taggedUsers)
  @JoinTable({
    name: "userPostTaggedAssociation",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "postId",
      referencedColumnName: "id",
    },
  })
  taggedPosts: Post[];

  // user tagged in comment relationship
  @ManyToMany(() => PostComments, comment => comment.taggedUsers)
  @JoinTable({
    name: "userPostCommentTaggedAssociation",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "commentId",
      referencedColumnName: "id",
    },
  })
  taggedComments: User[];

  

  // user following relationship
  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
      name: "userFollowingAssociation",
      joinColumn: { name: "userId", referencedColumnName: "id" },
      inverseJoinColumn: { name: "followingId", referencedColumnName: "id" }
  })
  following: User[];
  @ManyToMany(() => User, user => user.following)
  followers: User[];

  
  // user block relationship
 @OneToMany(()=>UserBlockAssociation,userBlockAssociation=>userBlockAssociation.blockedToUsers)
  blockedFromUsers:UserBlockAssociation[]

  @OneToMany(()=>UserBlockAssociation,userBlockAssociation=>userBlockAssociation.blockedFromUsers)
  blockedToUsers:UserBlockAssociation[]
}
