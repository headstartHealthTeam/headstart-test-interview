import { IsString, IsEmail, IsOptional } from "class-validator";

export class CreateCandidateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
