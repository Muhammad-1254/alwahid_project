import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { AdminUser } from "./admin-user.entity";
import { QualificationEnum } from "src/lib/types/user";
import { CreatorUser } from "./creator-user.entity";

@Entity()
export class SpecialUser extends ParentEntity<SpecialUser> {
    @OneToOne(() => User, user => user.id)
    id: number;

    @OneToMany(()=>AdminUser, adminUser=>adminUser.id,{cascade:true})
    authorized_admin_by:string[]

    @OneToMany(()=>CreatorUser, creatorUser=>creatorUser.id,{cascade:true})
    authorized_creator_by:string[]


    @Column()
    qualification:QualificationEnum

    @Column()
    works_on:string

    @OneToOne(()=>Location,)
    @JoinColumn()
    work_location:string
}

