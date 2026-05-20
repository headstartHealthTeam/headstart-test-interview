import axios from 'axios';
import { 
  Candidate, 
  Question, 
  Response, 
  InterviewResults, 
  CreateCandidateRequest, 
  SubmitResponseRequest,
  ReviewDashboardResponse,
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const interviewApi = {
  // Create a new candidate
  createCandidate: async (data: CreateCandidateRequest): Promise<Candidate> => {
    const response = await api.post('/interview/candidate', data);
    return response.data;
  },

  // Get all questions
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/interview/questions');
    return response.data;
  },

  // Submit a response
  submitResponse: async (candidateId: number, data: SubmitResponseRequest): Promise<Response> => {
    const response = await api.post(`/interview/response/${candidateId}`, data);
    return response.data;
  },

  // Get candidate results
  getCandidateResults: async (candidateId: number): Promise<InterviewResults> => {
    const response = await api.get(`/interview/results/${candidateId}`);
    return response.data;
  },

  // Seed questions (for development)
  seedQuestions: async (): Promise<{ message: string }> => {
    const response = await api.post('/interview/seed');
    return response.data;
  },

  // Get review dashboard data
  getReviewDashboard: async (): Promise<ReviewDashboardResponse> => {
    const response = await api.get('/interview/review-dashboard');
    return response.data;
  },
};
