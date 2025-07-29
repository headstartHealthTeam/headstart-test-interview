import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InterviewController } from "./interview.controller";
import { InterviewService } from "./interview.service";
import { Candidate } from "./entities/candidate.entity";
import { Question } from "./entities/question.entity";
import { Response } from "./entities/response.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, Question, Response])],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
