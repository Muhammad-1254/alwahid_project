import { Column, Entity, OneToMany } from "typeorm";
import { HashtagPostAssociation } from "./hashtag-post-association.entity";


@Entity("hashtags")
export class Hashtag {

    @Column({primary:true, type:'uuid'})
    id: string;

    @Column({type:'varchar', unique:true})
    name: string;

    @OneToMany(()=>HashtagPostAssociation, hashtagPostAssociation=>hashtagPostAssociation.hashtag)
    post_hashtag:HashtagPostAssociation[]
}

