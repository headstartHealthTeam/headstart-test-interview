export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface Response {
  id: number;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
  createdAt: string;
  question: Question;
}

export interface InterviewResults {
  candidate: Candidate;
  totalQuestions: number;
  totalPoints: number;
  totalPointsEarned: number;
  correctAnswers: number;
  score: number;
  responses: Response[];
}

export interface CreateCandidateRequest {
  name: string;
  email: string;
  phone?: string;
  position?: string;
}

export interface SubmitResponseRequest {
  questionId: number;
  selectedAnswer: number;
}

export interface ReviewDashboardCandidate {
  candidateId: number;
  name: string;
  email: string;
  position: string;
  submittedAt: string;
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
  candidates: ReviewDashboardCandidate[];
}
