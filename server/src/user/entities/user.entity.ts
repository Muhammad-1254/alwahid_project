import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuid, } from 'uuid';
import { AdminUser } from "./admin-user.entity";
import { CreatorUser } from "./creator-user.entity";
import { NormalUser } from "./normal-user.entity";
import { SpecialUser } from "./special-user.entity";


@Entity()
export class User extends ParentEntity<User> {
    @PrimaryGeneratedColumn('uuid',)
    id: string;

    @Column({nullable:true})
    email:string

    @Column({nullable:true})
    password:string

    @Column()
    firstname:string

    @Column()
    lastname:string

    @Column({})
    gender:Gender

    @Column({})
    age:number

    @Column({nullable:true})
    phone:string

    @Column({nullable:true})
    avatar_url:string

    @Column()
    auth_provider:AuthProvider

    @Column()
    user_role:UserRole

    @OneToOne(()=>AdminUser, adminUser=>adminUser.id)
    admin_id:typeof uuid

    @OneToOne(()=>CreatorUser, creatorUser=>creatorUser.id)
    creator_id:typeof uuid

    @OneToOne(()=>NormalUser, normalUser=>normalUser.id)
    normal_user_id:typeof uuid
    
    @OneToOne(()=>SpecialUser, specialUser=>specialUser.id)
    special_user_id:typeof uuid

    


    

}


enum Gender{
    MALE='male',
    FEMALE='female'
}


enum AuthProvider{
    LOCAL='local',
    GOOGLE='google'
}

enum UserRole{
    ADMIN='admin',
    CREATOR='creator',
    SPECIAL_USER='special_user',
    NORMAL_USER='normal_user',
}