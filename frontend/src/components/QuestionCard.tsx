import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedAnswer: number) => void;
  isAnswered: boolean;
  selectedAnswer?: number;
  isCorrect?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  isCorrect,
}) => {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | null>(null);

  const handleOptionClick = (optionIndex: number) => {
    if (!isAnswered) {
      setLocalSelectedAnswer(optionIndex);
      onAnswer(optionIndex);
    }
  };

  const getOptionClass = (optionIndex: number) => {
    if (!isAnswered) {
      return "border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer";
    }

    const isSelected = selectedAnswer === optionIndex || localSelectedAnswer === optionIndex;
    const isCorrectAnswer = optionIndex === question.correctAnswer;

    if (isSelected && isCorrectAnswer) {
      return "border-green-500 bg-green-50 text-green-800";
    } else if (isSelected && !isCorrectAnswer) {
      return "border-red-500 bg-red-50 text-red-800";
    } else if (isCorrectAnswer) {
      return "border-green-500 bg-green-50 text-green-800";
    } else {
      return "border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Question {question.id}
        </h3>
        <p className="text-gray-700 leading-relaxed">{question.text}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(index)}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${getOptionClass(index)}`}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center">
                {((selectedAnswer === index || localSelectedAnswer === index) && isAnswered) && (
                  <div className="w-3 h-3 rounded-full bg-current"></div>
                )}
              </div>
              <span className="font-medium">{option}</span>
            </div>
          </div>
        ))}
      </div>

      {isAnswered && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}

      {isAnswered && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <span className="text-green-600 font-semibold">✓ Correct!</span>
            ) : (
              <span className="text-red-600 font-semibold">✗ Incorrect</span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Points: {isCorrect ? question.points : 0} / {question.points}
          </div>
        </div>
      )}
    </div>
  );
}; 