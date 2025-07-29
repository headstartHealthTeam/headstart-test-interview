import { IsNumber, Min, Max } from "class-validator";

export class SubmitResponseDto {
  @IsNumber()
  questionId: number;

  @IsNumber()
  @Min(0)
  @Max(3)
  selectedAnswer: number;
}
