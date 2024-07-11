import { PostLikeEnum, PostLikeTargetEnum } from "src/lib/types/post";
import {  Column, Entity, JoinColumn,  ManyToOne } from "typeorm";
import { Post } from "./post.entity";
import { PostComments } from "./post-comment.entity";
import { ParentEntity } from "src/database/Parent.entity";

@Entity("posts_comments_likes")
export class PostCommentLike extends ParentEntity<PostCommentLike>{

    @Column({ primary: true, type: "uuid" })
    id: string;

    @Column({ type: "enum",enum:PostLikeTargetEnum })
    target_type:PostLikeTargetEnum

    @Column({ type: "enum",enum:PostLikeEnum })
    like_type:PostLikeEnum

    @Column({ type: "uuid" })
    user_id: string;


    @Column({nullable:true,type:'uuid'})
    post_id:string
    @ManyToOne(()=>Post,post=>post.postLikes,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:'post_id'})
    post:Post


    @Column({nullable:true,type:'uuid'})
    comment_id:string
    @ManyToOne(()=>PostComments,postComments=>postComments.commentLikes,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:'comment_id'})
    comment:PostComments





}