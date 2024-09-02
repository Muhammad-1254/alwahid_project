import { Column, Entity,  JoinColumn,  OneToOne,  } from "typeorm";
import { User } from "./user.entity";


@Entity('normalUsers')
export class NormalUser  {
    constructor(normalUser:Partial<NormalUser>){
        Object.assign(this,normalUser)
    }
    
    @Column({primary:true,foreignKeyConstraintName:'users.id',type:'uuid'})
    userId: string;


    @OneToOne(()=>User, user=>user.normalUser,{
        cascade:true,
        eager:true,
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    })
    @JoinColumn({name:'userId'})
    user:User

}