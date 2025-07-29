import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Response } from "./response.entity";

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  text: string;

  @Column("simple-array")
  options: string[];

  @Column()
  correctAnswer: number;

  @Column({ nullable: true })
  explanation: string;

  @Column({ default: 1 })
  points: number;

  @OneToMany(() => Response, (response) => response.question)
  responses: Response[];
}
