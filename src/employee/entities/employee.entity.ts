import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Employee, (employee) => employee.subordinates)
  reportsTo: Employee;

  @OneToMany(() => Employee, (employee) => employee.reportsTo)
  subordinates: Employee[];
}
