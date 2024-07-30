import { ParentEntity } from "src/database/Parent.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Hashtag } from "./hashtag.entity";
import { Post } from "src/post/entities/post.entity";

@Entity("hashtagPostAssociation")
export class HashtagPostAssociation extends ParentEntity<HashtagPostAssociation> {
  @Column({ primary: true, type: "uuid" })
  hashtagId: string;

  @Column({ primary: true, type: "uuid" })
  postId: string;

  @ManyToOne(() => Hashtag, hashtag => hashtag.postHashtag, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "hashtagId" })
  hashtag: Hashtag;

  @ManyToOne(() => Post, post => post.postHashtag, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "postId" })
  post: Post;
}
