import React, { useState, useEffect } from 'react';
import { Question, Candidate, InterviewResults } from '../types';
import { interviewApi } from '../services/api';
import { QuestionCard } from './QuestionCard';
import { ResultsCard } from './ResultsCard';

interface InterviewProps {
  candidate: Candidate;
}

export const Interview: React.FC<InterviewProps> = ({ candidate }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, { selectedAnswer: number; isCorrect: boolean }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsData = await interviewApi.getQuestions();
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (selectedAnswer: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      setIsSubmitting(true);
      
      // Submit response to backend
      await interviewApi.submitResponse(candidate.id, {
        questionId: currentQuestion.id,
        selectedAnswer,
      });

      // Update local state
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setResponses(prev => new Map(prev).set(currentQuestion.id, {
        selectedAnswer,
        isCorrect,
      }));

      // Move to next question or show results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Interview complete, load results
        await loadResults();
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadResults = async () => {
    try {
      const resultsData = await interviewApi.getCandidateResults(candidate.id);
      setResults(resultsData);
    } catch (err) {
      setError('Failed to load results. Please try again.');
      console.error('Error loading results:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <ResultsCard results={results} />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.get(currentQuestion?.id);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technical Interview</h1>
              <p className="text-gray-600">Welcome, {candidate.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</div>
              <div className="text-lg font-semibold text-blue-600">{Math.round(progress)}% Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            isAnswered={!!currentResponse}
            selectedAnswer={currentResponse?.selectedAnswer}
            isCorrect={currentResponse?.isCorrect}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-600">
            {isSubmitting ? 'Submitting...' : `${currentQuestionIndex + 1} of ${questions.length}`}
          </div>
          
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === questions.length - 1 || isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}; 