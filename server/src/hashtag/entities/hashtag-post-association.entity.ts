import { ParentEntity } from "src/database/Parent.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Hashtag } from "./hashtag.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("hashtag_post_association")
export class HashtagPostAssociation extends ParentEntity<HashtagPostAssociation> {
  @Column({ primary: true, type: "uuid" })
  hashtag_id: string;

  @Column({ primary: true, type: "uuid" })
  post_id: string;

  @ManyToOne(() => Hashtag, hashtag => hashtag.post_hashtag, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "hashtag_id" })
  hashtag: Hashtag;

  @ManyToOne(() => Post, post => post.post_hashtag, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;
}
