import { ParentEntity } from "src/database/Parent.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class NormalUser extends ParentEntity<NormalUser> {
    @OneToOne(() => User, user => user.id)
    id: number;

    @Column({default:false})
    is_verified:boolean

}