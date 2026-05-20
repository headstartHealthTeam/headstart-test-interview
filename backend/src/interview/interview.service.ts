import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Candidate } from "./entities/candidate.entity";
import { Question } from "./entities/question.entity";
import { Response } from "./entities/response.entity";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { SubmitResponseDto } from "./dto/submit-response.dto";

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

  async getReviewDashboard() {
    const questions = await this.questionRepository.find();
    const candidates = await this.candidateRepository.find({
      relations: ["responses", "responses.question"],
      order: { createdAt: "DESC" },
    });
    const totalQuestions = questions.length;

    const rows = candidates.map((candidate) => {
      const responses = candidate.responses ?? [];
      const correctAnswers = responses.filter((response) => response.isCorrect).length;
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const status = score >= 80 ? "Strong" : score >= 50 ? "Review" : "Needs Follow Up";
      return {
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        position: candidate.position || "Unspecified",
        submittedAt: candidate.createdAt,
        totalQuestions,
        answeredQuestions: responses.length,
        correctAnswers,
        score,
        status,
        nextStep: status === "Strong" ? "Move to manager review" : "Review manually",
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCandidates: rows.length,
        averageScore: rows.length
          ? Math.round(rows.reduce((sum, candidate) => sum + candidate.score, 0) / rows.length)
          : 0,
        candidatesNeedingReview: rows.filter((candidate) => candidate.status !== "Strong").length,
        completedCandidates: rows.filter(
          (candidate) => candidate.answeredQuestions === candidate.totalQuestions,
        ).length,
      },
      candidates: rows,
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
