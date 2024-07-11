import { Column, Entity,  JoinColumn,  OneToOne,  } from "typeorm";
import { User } from "./user.entity";


@Entity('normal_users')
export class NormalUser  {
    constructor(normalUser:Partial<NormalUser>){
        Object.assign(this,normalUser)
    }
    
    @Column({primary:true,foreignKeyConstraintName:'users.id',type:'uuid'})
    user_id: string;


    @OneToOne(()=>User, user=>user.normal_user,{
        cascade:true,
        eager:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'user_id'})
    user:User

}