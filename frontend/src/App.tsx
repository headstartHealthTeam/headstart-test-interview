import React, { useState, useEffect } from 'react';
import { Candidate, CreateCandidateRequest } from './types';
import { interviewApi } from './services/api';
import { CandidateForm } from './components/CandidateForm';
import { Interview } from './components/Interview';

function App() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCandidateSubmit = async (candidateData: CreateCandidateRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newCandidate = await interviewApi.createCandidate(candidateData);
      setCandidate(newCandidate);
      
      // Seed questions if this is the first candidate
      try {
        await interviewApi.seedQuestions();
      } catch (err) {
        console.warn('Questions may already be seeded:', err);
      }
    } catch (err) {
      setError('Failed to create candidate. Please try again.');
      console.error('Error creating candidate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCandidate(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!candidate ? (
        <div className="min-h-screen flex items-center justify-center py-8">
          <div className="w-full max-w-md">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-600 text-xl mr-2">⚠️</div>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
            
            <CandidateForm 
              onSubmit={handleCandidateSubmit} 
              isLoading={isLoading} 
            />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This is a technical interview application. Please provide your information to begin.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Interview candidate={candidate} />
      )}
      
      {/* Restart button - only show when interview is complete */}
      {candidate && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleRestart}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Restart Interview
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 