import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class ParentEntity<T> {
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;

  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
