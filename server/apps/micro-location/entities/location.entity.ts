import { ParentEntity } from "@app/shared/utils/parent-entity.utils";
import { CreatorUser } from "apps/micro-user/src/entities/user-creator.entity";
import { User } from "apps/micro-user/src/entities/user.entity";
import { Column, Entity,    JoinColumn,    OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('locations')
export class Location extends ParentEntity<Location> {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type:'varchar',})
    country: string

    @Column({type:"varchar",})
    province: string

    @Column({type:"varchar",})
    city: string

    @Column({type:"varchar",nullable:true})
    zipCode:string

    @Column({type:"varchar",nullable:true})
    street:string

    @Column({nullable:true,type:'uuid'})
    workUserId:string

    @OneToOne(()=>CreatorUser,creatorUser=>creatorUser.workLocation,{
        cascade:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'workUserId'})
    creatorWorkLocation:CreatorUser


    @Column({nullable:true,type:'uuid'})
    userId:string

    @OneToOne(()=>User,user=>user.location,{
        cascade:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'userId'})
    userLocation:User

    

}