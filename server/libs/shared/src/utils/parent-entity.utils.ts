import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class ParentEntity<T> {
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
