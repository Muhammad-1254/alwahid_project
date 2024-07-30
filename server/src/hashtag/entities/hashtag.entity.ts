import { Column, Entity, OneToMany } from "typeorm";
import { HashtagPostAssociation } from "./hashtag-post-association.entity";
import { ParentEntity } from "src/database/Parent.entity";


@Entity("hashtags")
export class Hashtag extends ParentEntity<Hashtag> {

    @Column({primary:true, type:'uuid'})
    id: string;

    @Column({type:'varchar', unique:true})
    name: string;

    @OneToMany(()=>HashtagPostAssociation, hashtagPostAssociation=>hashtagPostAssociation.hashtag)
    postHashtag:HashtagPostAssociation[]
}

