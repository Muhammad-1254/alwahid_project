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
  avatar_url: string;

  @Column({ nullable: true, type: "int" })
  age: number;

  @Column({ nullable: true, type: "varchar" })
  phone_number: string;

  @Column({ type: "enum", enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: "enum", enum: UserRoleEnum })
  user_role: UserRoleEnum;

  @Column({ type: "date" })
  date_of_birth: Date;

  @Column({ type: "enum", enum: AuthProviderEnum })
  auth_provider: AuthProviderEnum;

  @Column({ default: false, type: "boolean" })
  is_verified: boolean;

  @Column({ default: true, type: "boolean" })
  is_active: boolean;

  @Column({ nullable: true, default: false, type: "boolean" })
  is_special_user: boolean;

  @Column({ nullable: true, type: "date" })
  authorized_special_user_at: Date;

  @Column({ nullable: true, type: "uuid" })
  authorized_special_user_by_creator_id: string;

  @Column({ nullable: true, type: "uuid" })
  authorized_special_user_by_admin_id: string;

  @OneToOne(() => Location, Location => Location.user_location)
  location: Location;

  @OneToOne(() => AdminUser, adminUser => adminUser.user)
  admin_user: AdminUser;

  @OneToOne(() => CreatorUser, creatorUser => creatorUser.user)
  creator_user: CreatorUser;

  @OneToOne(() => NormalUser, normalUser => normalUser.user)
  normal_user: NormalUser;

  // user tagged in post relationship
  @ManyToMany(() => Post, post => post.tagged_users)
  @JoinTable({
    name: "user_post_tagged_association",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "post_id",
      referencedColumnName: "id",
    },
  })
  tagged_posts: User[];

  // user tagged in comment relationship
  @ManyToMany(() => PostComments, comment => comment.tagged_users)
  @JoinTable({
    name: "user_post_comment_tagged_association",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "comment_id",
      referencedColumnName: "id",
    },
  })
  tagged_comments: User[];

  

  // user following relationship
  @ManyToMany(() => User, user => user.following)
  @JoinTable({
    name: "user_following_association",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "following_id",
      referencedColumnName: "id",
    },
  })
  following: User[];
  @ManyToMany(() => User, user => user.followers)
  followers: User[];

  // user block relationship
 @OneToMany(()=>UserBlockAssociation,userBlockAssociation=>userBlockAssociation.blocked_to_users)
  blocked_from_users:UserBlockAssociation[]

  @OneToMany(()=>UserBlockAssociation,userBlockAssociation=>userBlockAssociation.blocked_from_users)
  blocked_to_users:UserBlockAssociation[]
}
