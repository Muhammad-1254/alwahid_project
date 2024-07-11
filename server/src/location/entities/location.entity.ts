import { ParentEntity } from "src/database/Parent.entity";
import { CityEnum, CountryEnum, ProvinceEnum } from "src/lib/types/location";
import { CreatorUser } from "src/user/entities/user-creator.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity,    JoinColumn,    OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('locations')
export class Location extends ParentEntity<Location> {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type:'enum',enum:CountryEnum})
    country: CountryEnum

    @Column({type:'enum',enum:ProvinceEnum})
    province: ProvinceEnum

    @Column({type:'enum',enum:CityEnum})
    city: CityEnum

    @Column()
    zip_code:string

    @Column()
    street:string

    @Column({nullable:true,type:'uuid'})
    work_user_id:string

    @OneToOne(()=>CreatorUser,creatorUser=>creatorUser.work_location,{
        cascade:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'work_user_id'})
    creator_work_location:CreatorUser


    @Column({nullable:true,type:'uuid'})
    user_id:string

    @OneToOne(()=>User,user=>user.location,{
        cascade:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'user_id'})
    user_location:User

    

}