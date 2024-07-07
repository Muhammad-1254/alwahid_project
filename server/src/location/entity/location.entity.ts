import { ParentEntity } from "src/database/Parent.entity";
import { CityEnum, CountryEnum, ProvinceEnum } from "src/lib/types/location";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Location extends ParentEntity<Location> {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    country: CountryEnum

    @Column()
    province: ProvinceEnum

    @Column()
    city: CityEnum

    @Column()
    zip_code:string

    @Column()
    street:string
}