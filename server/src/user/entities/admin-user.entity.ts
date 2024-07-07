import { ParentEntity } from "src/database/Parent.entity";
import { Entity,  OneToOne, } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class AdminUser extends ParentEntity<AdminUser> {
  @OneToOne(() => User, user => user.id)
  id: number;
}
