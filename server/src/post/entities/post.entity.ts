import { ParentEntity } from "src/database/Parent.entity";
import {  Column, Entity, JoinColumn,  ManyToMany,  ManyToOne, OneToMany } from "typeorm";
import { PostMedia } from "./post-media.entity";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { AdminUser } from "src/user/entities/user-admin.entity";
import { PostCommentLike } from "./post-comment-like.entity";
import { PostComments } from "./post-comment.entity";
import { User } from "src/user/entities/user.entity";
import { HashtagPostAssociation } from "src/hashtag/entities/hashtag-post-association.entity";
import { UserSavedPostsAssociation } from "src/user/entities/user-saved-post.entity";




@Entity("posts")
export class Post extends ParentEntity<Post> {

    @Column({ primary: true, type: "uuid" })
    id:string;

    @Column({ nullable: true, type: "text" })
    textContent: string;

    
   

    @OneToMany(()=>PostMedia,postMedia =>postMedia.post)
    postMedias:PostMedia[]

    @OneToMany(()=>PostComments,postComments =>postComments.post)
    postComments:PostComments[]

    @OneToMany(()=>PostCommentLike,postMedia =>postMedia.post)
    postLikes:PostCommentLike[]
    

    @Column({nullable:true,type:'uuid'})
    creatorUserId:string;
    @ManyToOne(()=>CreatorUser,creatorUser=>creatorUser.posts,{
        cascade:true,
        eager:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"creatorUserId"})
    creatorUser:CreatorUser


    @Column({nullable:true,type:'uuid'})
    adminUserId:string;
    @ManyToOne(()=>AdminUser,adminUser=>adminUser.posts,{
        cascade:true,
        eager:true,
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
    })
    @JoinColumn({name:"adminUserId"})
    adminUser:AdminUser
   
    @ManyToMany(()=>User,user=>user.taggedPosts)
    taggedUsers:User[]

    @OneToMany(()=>HashtagPostAssociation, hashtagPostAssociation=>hashtagPostAssociation.post)
    postHashtag:HashtagPostAssociation[]
    
    @OneToMany(()=>UserSavedPostsAssociation,userSavedPostsAssociation=>userSavedPostsAssociation.post)
    savedByUsers:UserSavedPostsAssociation[]
}



