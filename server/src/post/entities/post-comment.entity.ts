import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Post } from "./post.entity";
import { PostCommentLike } from "./post-comment-like.entity";
import { ParentEntity } from "src/database/Parent.entity";
import { User } from "src/user/entities/user.entity";

@Entity("posts_comments")
export class PostComments extends ParentEntity<PostComments>{
   

    @Column({ primary: true, type: "uuid" })
    id: string;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "uuid" })
    user_id: string;


    @Column({nullable:true, type:'uuid'})
    post_id:string;
    @ManyToOne(()=>Post,post=>post.postComments,{
        onDelete:"CASCADE",
        onUpdate:'CASCADE',
        eager:true,
        cascade:true
    })
    @JoinColumn({name:"post_id"})
    post:Post

    @OneToMany(()=>PostCommentLike,postCommentLike=>postCommentLike.comment)
    commentLikes:PostCommentLike[]

    @ManyToMany(()=>User,user=>user.tagged_comments)
    tagged_users:User[]

 
}