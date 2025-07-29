import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Candidate } from "./candidate.entity";
import { Question } from "./question.entity";

@Entity()
export class Response {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  selectedAnswer: number;

  @Column()
  isCorrect: boolean;

  @Column({ default: 0 })
  pointsEarned: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Candidate, (candidate) => candidate.responses)
  candidate: Candidate;

  @ManyToOne(() => Question, (question) => question.responses)
  question: Question;
}
