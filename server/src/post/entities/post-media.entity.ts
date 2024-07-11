import { PostMediaEnum } from "src/lib/types/post";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Post } from "./post.entity";




@Entity("posts_medias")
export class PostMedia {
    constructor(postMedia: Partial<PostMedia>) {
        Object.assign(this, postMedia);
    }
    @Column({ primary: true, type: "uuid" })
    id:string

    @Column({ type: "enum",enum:PostMediaEnum })
    post_type:PostMediaEnum

    @Column({ type: "text" })
    url:string


    @Column({type:'uuid'})
    post_id:string
    @ManyToOne(()=>Post,post=>post.postMedias,{
        onDelete:"CASCADE",
        onUpdate:"CASCADE",
        cascade:true,
        eager:true
    })
    @JoinColumn({name:"post_id"})
    post:Post

}
