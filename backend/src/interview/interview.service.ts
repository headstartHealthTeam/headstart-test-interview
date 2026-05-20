import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Candidate } from "./entities/candidate.entity";
import { Question } from "./entities/question.entity";
import { Response } from "./entities/response.entity";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { SubmitResponseDto } from "./dto/submit-response.dto";

export interface ReviewDashboardStatusConfig {
  label: string;
  minimumScore: number;
  nextStep: string;
}

export interface ReviewDashboardCandidateSummary {
  candidateId: number;
  name: string;
  email: string;
  position: string;
  submittedAt: Date;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalPointsEarned: number;
  score: number;
  status: string;
  nextStep: string;
}

export interface ReviewDashboardSummary {
  totalCandidates: number;
  averageScore: number;
  candidatesNeedingReview: number;
  completedCandidates: number;
}

export interface ReviewDashboardResponse {
  generatedAt: string;
  summary: ReviewDashboardSummary;
  candidates: ReviewDashboardCandidateSummary[];
}

const reviewDashboardStatusPipeline: ReviewDashboardStatusConfig[] = [
  {
    label: "Strong",
    minimumScore: 80,
    nextStep: "Move to hiring manager review",
  },
  {
    label: "Review",
    minimumScore: 50,
    nextStep: "Review answers before deciding",
  },
  {
    label: "Needs Follow Up",
    minimumScore: 0,
    nextStep: "Send follow-up exercise",
  },
];

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
  ) {}

  async createCandidate(
    createCandidateDto: CreateCandidateDto,
  ): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createCandidateDto);
    return await this.candidateRepository.save(candidate);
  }

  async getQuestions(): Promise<Question[]> {
    return await this.questionRepository.find({
      order: { id: "ASC" },
    });
  }

  async submitResponse(
    candidateId: number,
    submitResponseDto: SubmitResponseDto,
  ): Promise<Response> {
    const { questionId, selectedAnswer } = submitResponseDto;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!question || !candidate) {
      throw new Error("Question or candidate not found");
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const pointsEarned = isCorrect ? question.points : 0;

    const response = this.responseRepository.create({
      selectedAnswer,
      isCorrect,
      pointsEarned,
      candidate,
      question,
    });

    return await this.responseRepository.save(response);
  }

  async getCandidateResults(candidateId: number) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
      relations: ["responses", "responses.question"],
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const totalQuestions = await this.questionRepository.count();
    const totalPoints = await this.questionRepository
      .createQueryBuilder("question")
      .select("SUM(question.points)", "total")
      .getRawOne();

    const totalPointsEarned = candidate.responses.reduce(
      (sum, response) => sum + response.pointsEarned,
      0,
    );
    const correctAnswers = candidate.responses.filter(
      (response) => response.isCorrect,
    ).length;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      candidate,
      totalQuestions,
      totalPoints: totalPoints.total || 0,
      totalPointsEarned,
      correctAnswers,
      score: Math.round(score * 100) / 100,
      responses: candidate.responses,
    };
  }

  async getAllResults() {
    return await this.responseRepository.find({
      relations: ["candidate", "question"],
    });
  }

  async getReviewDashboard(): Promise<ReviewDashboardResponse> {
    const questions = await this.questionRepository.find({
      order: { id: "ASC" },
    });
    const candidates = await this.candidateRepository.find({
      relations: ["responses", "responses.question"],
      order: { createdAt: "DESC" },
    });

    const totalQuestionCount = this.resolveTotalQuestionCount(questions);
    const candidateSummaries = candidates.map((candidate) =>
      this.mapCandidateIntoDashboardSummary(candidate, totalQuestionCount),
    );

    return this.composeReviewDashboardResponse(candidateSummaries);
  }

  private resolveTotalQuestionCount(questions: Question[]): number {
    return questions.length;
  }

  private mapCandidateIntoDashboardSummary(
    candidate: Candidate,
    totalQuestionCount: number,
  ): ReviewDashboardCandidateSummary {
    const responses = candidate.responses ?? [];
    const correctAnswers = this.calculateCorrectAnswerCount(responses);
    const totalPointsEarned = this.calculateEarnedPoints(responses);
    const score = this.calculateScore(correctAnswers, totalQuestionCount);
    const statusConfig = this.resolveStatusConfiguration(score);

    return {
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position || "Unspecified",
      submittedAt: candidate.createdAt,
      totalQuestions: totalQuestionCount,
      answeredQuestions: responses.length,
      correctAnswers,
      totalPointsEarned,
      score,
      status: statusConfig.label,
      nextStep: statusConfig.nextStep,
    };
  }

  private calculateCorrectAnswerCount(responses: Response[]): number {
    return responses.filter((response) => response.isCorrect).length;
  }

  private calculateEarnedPoints(responses: Response[]): number {
    return responses.reduce((sum, response) => sum + response.pointsEarned, 0);
  }

  private calculateScore(correctAnswers: number, totalQuestionCount: number): number {
    const score = totalQuestionCount > 0 ? (correctAnswers / totalQuestionCount) * 100 : 0;
    return Math.round(score * 100) / 100;
  }

  private resolveStatusConfiguration(score: number): ReviewDashboardStatusConfig {
    const matchingStatus = reviewDashboardStatusPipeline.find(
      (statusConfig) => score >= statusConfig.minimumScore,
    );

    return matchingStatus ?? reviewDashboardStatusPipeline[reviewDashboardStatusPipeline.length - 1];
  }

  private composeReviewDashboardResponse(
    candidates: ReviewDashboardCandidateSummary[],
  ): ReviewDashboardResponse {
    const completedCandidates = candidates.filter(
      (candidate) => candidate.answeredQuestions === candidate.totalQuestions,
    ).length;
    const candidatesNeedingReview = candidates.filter(
      (candidate) => candidate.status !== "Strong",
    ).length;
    const averageScore =
      candidates.length > 0
        ? candidates.reduce((sum, candidate) => sum + candidate.score, 0) / candidates.length
        : 0;

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCandidates: candidates.length,
        averageScore: Math.round(averageScore * 100) / 100,
        candidatesNeedingReview,
        completedCandidates,
      },
      candidates,
    };
  }

  async seedQuestions() {
    const questions = [
      {
        text: "What is TypeScript?",
        options: [
          "A superset of JavaScript",
          "A completely different programming language",
          "A database management system",
          "A web framework",
        ],
        correctAnswer: 0,
        explanation:
          "TypeScript is a superset of JavaScript that adds static typing.",
        points: 1,
      },
      {
        text: "Which of the following is NOT a valid TypeScript type?",
        options: ["string", "number", "boolean", "array"],
        correctAnswer: 3,
        explanation:
          'TypeScript uses "Array<T>" or "T[]" for array types, not "array".',
        points: 1,
      },
      {
        text: 'What does the "async" keyword do in JavaScript/TypeScript?',
        options: [
          "Makes a function synchronous",
          "Makes a function return a Promise",
          "Makes a function run faster",
          "Makes a function private",
        ],
        correctAnswer: 1,
        explanation:
          "The async keyword makes a function return a Promise automatically.",
        points: 1,
      },
      {
        text: "Which HTTP method is typically used for creating new resources?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: 1,
        explanation:
          "POST is typically used for creating new resources in REST APIs.",
        points: 1,
      },
      {
        text: "What is the purpose of TypeORM?",
        options: [
          "To create TypeScript files",
          "To manage database operations with TypeScript",
          "To compile TypeScript to JavaScript",
          "To test TypeScript code",
        ],
        correctAnswer: 1,
        explanation:
          "TypeORM is an ORM (Object-Relational Mapping) library for TypeScript and JavaScript.",
        points: 1,
      },
    ];

    for (const questionData of questions) {
      const existingQuestion = await this.questionRepository.findOne({
        where: { text: questionData.text },
      });

      if (!existingQuestion) {
        const question = this.questionRepository.create(questionData);
        await this.questionRepository.save(question);
      }
    }
  }
}
