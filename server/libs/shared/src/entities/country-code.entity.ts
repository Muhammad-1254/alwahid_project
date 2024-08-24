import { Column, Entity,  PrimaryGeneratedColumn } from "typeorm";


@Entity('countryCode')
export class CountryCode {
    @PrimaryGeneratedColumn({type:'int',})
    id:number
    @Column({type:'varchar',unique:true, length:100})
    countryName:string

    @Column({type:'varchar',length:20})
    countryCode:string

    @Column({type:'varchar',length:6})
    isoCode:string

    @Column({type:'text',})
    flagUrl:string
}