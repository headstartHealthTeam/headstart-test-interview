import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { SubmitResponseDto } from "./dto/submit-response.dto";

@Controller("interview")
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post("candidate")
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    return await this.interviewService.createCandidate(createCandidateDto);
  }

  @Get("questions")
  async getQuestions() {
    return await this.interviewService.getQuestions();
  }

  @Post("response/:candidateId")
  async submitResponse(
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Body() submitResponseDto: SubmitResponseDto,
  ) {
    return await this.interviewService.submitResponse(
      candidateId,
      submitResponseDto,
    );
  }

  @Get("results/:candidateId")
  async getCandidateResults(
    @Param("candidateId", ParseIntPipe) candidateId: number,
  ) {
    return await this.interviewService.getCandidateResults(candidateId);
  }

  @Post("seed")
  async seedQuestions() {
    await this.interviewService.seedQuestions();
    return { message: "Questions seeded successfully" };
  }
}
