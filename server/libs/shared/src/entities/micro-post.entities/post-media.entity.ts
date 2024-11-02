import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Post } from "./post.entity";




@Entity("postMedias")
export class PostMedia {
    constructor(postMedia: Partial<PostMedia>) {
        Object.assign(this, postMedia);
    }
    @Column({ primary: true, type: "uuid" })
    id:string

    @Column({ type: "text",})
    mimeType:string

    @Column({ type: "text" })
    url:string


    @Column({type:'uuid'})
    postId:string
    @ManyToOne(()=>Post,post=>post.postMedias,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:"postId"})
    post:Post

}
