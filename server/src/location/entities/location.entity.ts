import { ParentEntity } from "src/database/Parent.entity";
import { CityEnum, CountryEnum, ProvinceEnum } from "src/lib/types/location";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity,    JoinColumn,    OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('locations')
export class Location extends ParentEntity<Location> {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type:'enum',enum:CountryEnum,})
    country: CountryEnum

    @Column({type:'enum',enum:ProvinceEnum})
    province: ProvinceEnum

    @Column({type:'enum',enum:CityEnum})
    city: CityEnum

    @Column()
    zipCode:string

    @Column()
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