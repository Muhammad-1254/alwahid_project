import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Post } from "./post.entity";
import { PostCommentLike } from "./post-comment-like.entity";
import { ParentEntity } from "src/database/Parent.entity";
import { User } from "src/user/entities/user.entity";

@Entity("postComments")
export class PostComments extends ParentEntity<PostComments>{
   

    @Column({ primary: true, type: "uuid" })
    id: string;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "uuid" })
    userId: string;
    @ManyToOne(()=>User,user=>user.id)
    @JoinColumn({name:"userId"})
    user:User


    @Column({nullable:true, type:'uuid'})
    postId:string;
    @ManyToOne(()=>Post,post=>post.postComments,{
        onDelete:"CASCADE",
        onUpdate:'CASCADE',
        eager:true,
        cascade:true
    })
    @JoinColumn({name:"postId"})
    post:Post

    @OneToMany(()=>PostCommentLike,postCommentLike=>postCommentLike.comment)
    commentLikes:PostCommentLike[]

    @ManyToMany(()=>User,user=>user.taggedComments)
    taggedUsers:User[]

 
}