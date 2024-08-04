import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("userSavedPostsAssociation")
export class UserSavedPostsAssociation extends ParentEntity<UserSavedPostsAssociation> {
  @Column({ primary: true, type: "uuid" })
  userId: string;

  @Column({ primary: true, type: "uuid" })
  postId: string;

  @ManyToOne(() => User, user => user.savedPosts)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Post, post => post.savedByUsers)
  @JoinColumn({ name: "postId" })
  post: Post;
}
