import { PostLikeEnum, PostLikeTargetEnum } from "src/lib/types/post";
import {  Column, Entity, JoinColumn,  ManyToOne } from "typeorm";
import { Post } from "./post.entity";
import { PostComments } from "./post-comment.entity";
import { ParentEntity } from "src/database/Parent.entity";
import { User } from "src/user/entities/user.entity";

@Entity("postCommentLikes")
export class PostCommentLike extends ParentEntity<PostCommentLike>{

    @Column({ primary: true, type: "uuid" })
    id: string;

    @Column({ type: "enum",enum:PostLikeTargetEnum })
    targetType:PostLikeTargetEnum

    @Column({ type: "enum",enum:PostLikeEnum })
    likeType:PostLikeEnum

    @Column({ type: "uuid" })
    userId: string;
    @ManyToOne(()=>User,user=>user.id)
    @JoinColumn({name:"userId"})
    user:User


    @Column({nullable:true,type:'uuid'})
    postId:string
    @ManyToOne(()=>Post,post=>post.postLikes,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:'postId'})
    post:Post


    @Column({nullable:true,type:'uuid'})
    commentId:string
    @ManyToOne(()=>PostComments,postComments=>postComments.commentLikes,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:'commentId'})
    comment:PostComments





}