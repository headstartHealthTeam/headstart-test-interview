import React from 'react';
import { InterviewResults } from '../types';

interface ResultsCardProps {
  results: InterviewResults;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ results }) => {
  const { candidate, totalQuestions, totalPoints, totalPointsEarned, correctAnswers, score, responses } = results;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
        <p className="text-gray-600">Thank you for participating in our interview process.</p>
      </div>

      {/* Candidate Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidate Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium">Name:</span> {candidate.name}</div>
          <div><span className="font-medium">Email:</span> {candidate.email}</div>
          {candidate.phone && <div><span className="font-medium">Phone:</span> {candidate.phone}</div>}
          {candidate.position && <div><span className="font-medium">Position:</span> {candidate.position}</div>}
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{score}%</div>
          <div className="text-sm text-blue-800">Overall Score</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
          <div className="text-sm text-green-800">Correct Answers</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalPointsEarned}/{totalPoints}</div>
          <div className="text-sm text-purple-800">Points Earned</div>
        </div>
      </div>

      {/* Performance Message */}
      <div className={`text-center p-4 rounded-lg mb-6 ${getScoreColor(score).replace('text-', 'bg-').replace('-600', '-100')}`}>
        <h3 className={`text-xl font-semibold ${getScoreColor(score)} mb-1`}>
          {getScoreMessage(score)}
        </h3>
        <p className={`text-sm ${getScoreColor(score).replace('-600', '-700')}`}>
          You answered {correctAnswers} out of {totalQuestions} questions correctly.
        </p>
      </div>

      {/* Detailed Results */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Details</h3>
        <div className="space-y-3">
          {responses.map((response) => (
            <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600">Q{response.question.id}</span>
                <span className="text-sm text-gray-800">{response.question.text.substring(0, 50)}...</span>
              </div>
              <div className="flex items-center space-x-2">
                {response.isCorrect ? (
                  <span className="text-green-600 font-semibold">✓</span>
                ) : (
                  <span className="text-red-600 font-semibold">✗</span>
                )}
                <span className="text-sm text-gray-600">
                  {response.pointsEarned}/{response.question.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Your results have been recorded. We'll be in touch soon!
        </p>
      </div>
    </div>
  );
};
