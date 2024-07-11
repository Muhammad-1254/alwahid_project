import { ParentEntity } from "src/database/Parent.entity";
import { PostUserTypeEnum } from "src/lib/types/post";
import {  Column, Entity, JoinColumn,  ManyToMany,  ManyToOne, OneToMany } from "typeorm";
import { PostMedia } from "./post-media.entity";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { AdminUser } from "src/user/entities/user-admin.entity";
import { PostCommentLike } from "./post-comment-like.entity";
import { PostComments } from "./post-comment.entity";
import { User } from "src/user/entities/user.entity";
import { HashtagPostAssociation } from "src/hashtag/entities/hashtag-post-association.entity";




@Entity("posts")
export class Post extends ParentEntity<Post> {

    @Column({ primary: true, type: "uuid" })
    id:string;

    @Column({ nullable: true, type: "text" })
    text_content: string;

    @Column({ type: "enum",enum: PostUserTypeEnum})
    post_by: PostUserTypeEnum;

    @OneToMany(()=>PostMedia,postMedia =>postMedia.post)
    postMedias:PostMedia[]

    @OneToMany(()=>PostComments,postComments =>postComments.post)
    postComments:PostComments[]

    @OneToMany(()=>PostCommentLike,postMedia =>postMedia.post)
    postLikes:PostCommentLike[]
    

    @Column({nullable:true,type:'uuid'})
    creator_user_id:string;
    @ManyToOne(()=>CreatorUser,creatorUser=>creatorUser.posts,{
        cascade:true,
        eager:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"creator_user_id"})
    creator_user:CreatorUser


    @Column({nullable:true,type:'uuid'})
    admin_user_id:string;
    @ManyToOne(()=>AdminUser,adminUser=>adminUser.posts,{
        cascade:true,
        eager:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"admin_user_id"})
    admin_user:AdminUser
   
    @ManyToMany(()=>User,user=>user.tagged_posts)
    tagged_users:User[]

    @OneToMany(()=>HashtagPostAssociation, hashtagPostAssociation=>hashtagPostAssociation.post)
    post_hashtag:HashtagPostAssociation[]
    
}



