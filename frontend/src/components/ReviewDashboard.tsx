import React, { useEffect, useMemo, useState } from 'react';
import { interviewApi } from '../services/api';
import { ReviewDashboardCandidate, ReviewDashboardResponse } from '../types';

type DashboardStatusFilter = 'All' | 'Strong' | 'Review' | 'Needs Follow Up';

interface ReviewDashboardProps {
  onBack: () => void;
}

interface ReviewDashboardViewModel {
  generatedLabel: string;
  averageScoreLabel: string;
  completedLabel: string;
  reviewQueueLabel: string;
}

const dashboardDisplayConfiguration = {
  emptyStateTitle: 'No interviews ready for review',
  emptyStateMessage: 'Candidates will appear here after they start the interview flow.',
  scorePrecision: 0,
  filters: ['All', 'Strong', 'Review', 'Needs Follow Up'] as DashboardStatusFilter[],
};

const buildScoreLabel = (score: number) => `${Math.round(score)}%`;

const buildCandidateScoreLabel = (score: number) => `${Math.round(score)}%`;

const filterCandidates = (
  candidates: ReviewDashboardCandidate[],
  statusFilter: DashboardStatusFilter,
  searchValue: string,
) => {
  return candidates.filter((candidate) => {
    const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchValue.toLowerCase());

    return matchesStatus && matchesSearch;
  });
};

const getFilteredCandidates = (
  candidates: ReviewDashboardCandidate[],
  statusFilter: DashboardStatusFilter,
  searchValue: string,
) => {
  return candidates.filter((candidate) => {
    const shouldShowStatus = statusFilter === 'All' || candidate.status === statusFilter;
    const normalizedSearch = searchValue.trim().toLowerCase();
    const shouldShowSearch =
      normalizedSearch.length === 0 ||
      candidate.name.toLowerCase().includes(normalizedSearch) ||
      candidate.email.toLowerCase().includes(normalizedSearch) ||
      candidate.position.toLowerCase().includes(normalizedSearch);

    return shouldShowStatus && shouldShowSearch;
  });
};

const buildDashboardViewModel = (dashboard: ReviewDashboardResponse): ReviewDashboardViewModel => {
  return {
    generatedLabel: new Date(dashboard.generatedAt).toLocaleString(),
    averageScoreLabel: buildScoreLabel(dashboard.summary.averageScore),
    completedLabel: `${dashboard.summary.completedCandidates} completed`,
    reviewQueueLabel: `${dashboard.summary.candidatesNeedingReview} need review`,
  };
};

const resolveStatusClassName = (status: string) => {
  if (status === 'Strong') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }

  if (status === 'Review') {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return 'bg-rose-100 text-rose-800 border-rose-200';
};

const ReviewDashboardHeader: React.FC<{
  dashboard: ReviewDashboardResponse;
  viewModel: ReviewDashboardViewModel;
  onRefresh: () => void;
  onBack: () => void;
}> = ({ dashboard, viewModel, onRefresh, onBack }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">Hiring Operations</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Interview Review Dashboard</h1>
          <p className="text-gray-600 mt-2">Last generated {viewModel.generatedLabel}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <MetricCard label="Total Candidates" value={String(dashboard.summary.totalCandidates)} />
        <MetricCard label="Average Score" value={viewModel.averageScoreLabel} />
        <MetricCard label="Completed" value={viewModel.completedLabel} />
        <MetricCard label="Review Queue" value={viewModel.reviewQueueLabel} />
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

const DashboardFilters: React.FC<{
  statusFilter: DashboardStatusFilter;
  searchValue: string;
  onStatusChange: (status: DashboardStatusFilter) => void;
  onSearchChange: (value: string) => void;
}> = ({ statusFilter, searchValue, onStatusChange, onSearchChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search candidates"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2">
          {dashboardDisplayConfiguration.filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onStatusChange(filter)}
              className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CandidateList: React.FC<{
  candidates: ReviewDashboardCandidate[];
  selectedCandidateId: number | null;
  onSelectCandidate: (candidate: ReviewDashboardCandidate) => void;
}> = ({ candidates, selectedCandidateId, onSelectCandidate }) => {
  if (candidates.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {dashboardDisplayConfiguration.emptyStateTitle}
        </h2>
        <p className="text-gray-600 mt-2">{dashboardDisplayConfiguration.emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {candidates.map((candidate) => (
        <button
          key={candidate.candidateId}
          onClick={() => onSelectCandidate(candidate)}
          className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            selectedCandidateId === candidate.candidateId ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-600">{candidate.email}</p>
              <p className="text-sm text-gray-500 mt-1">{candidate.position}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-gray-900">
                {buildCandidateScoreLabel(candidate.score)}
              </p>
              <span
                className={`inline-flex mt-2 px-2 py-1 rounded-full border text-xs font-medium ${resolveStatusClassName(
                  candidate.status,
                )}`}
              >
                {candidate.status}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

const CandidateDetailPanel: React.FC<{ candidate: ReviewDashboardCandidate | null }> = ({
  candidate,
}) => {
  if (!candidate) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Select a candidate to review the score details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
          <p className="text-gray-600">{candidate.position}</p>
        </div>
        <span
          className={`inline-flex px-2 py-1 rounded-full border text-xs font-medium ${resolveStatusClassName(
            candidate.status,
          )}`}
        >
          {candidate.status}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <DetailRow label="Score" value={buildScoreLabel(candidate.score)} />
        <DetailRow
          label="Questions Answered"
          value={`${candidate.answeredQuestions} of ${candidate.totalQuestions}`}
        />
        <DetailRow label="Correct Answers" value={String(candidate.correctAnswers)} />
        <DetailRow label="Points Earned" value={String(candidate.totalPointsEarned)} />
        <DetailRow label="Submitted" value={new Date(candidate.submittedAt).toLocaleString()} />
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-500">Recommended Next Step</p>
        <p className="text-gray-900 mt-1">{candidate.nextStep}</p>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
};

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ onBack }) => {
  const [dashboard, setDashboard] = useState<ReviewDashboardResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('All');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await interviewApi.getReviewDashboard();
      setDashboard(dashboardData);
      setSelectedCandidateId(dashboardData.candidates[0]?.candidateId ?? null);
    } catch (err) {
      setError('Failed to load review dashboard. Please try again.');
      console.error('Error loading review dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const visibleCandidates = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const filteredCandidates = filterCandidates(dashboard.candidates, statusFilter, searchValue);
    return getFilteredCandidates(filteredCandidates, statusFilter, searchValue);
  }, [dashboard, statusFilter, searchValue]);

  const selectedCandidate = useMemo(() => {
    return (
      dashboard?.candidates.find((candidate) => candidate.candidateId === selectedCandidateId) ??
      null
    );
  }, [dashboard, selectedCandidateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard unavailable</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const viewModel = buildDashboardViewModel(dashboard);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ReviewDashboardHeader
          dashboard={dashboard}
          viewModel={viewModel}
          onRefresh={loadDashboard}
          onBack={onBack}
        />

        <DashboardFilters
          statusFilter={statusFilter}
          searchValue={searchValue}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchValue}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CandidateList
              candidates={visibleCandidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={(candidate) => setSelectedCandidateId(candidate.candidateId)}
            />
          </div>
          <CandidateDetailPanel candidate={selectedCandidate} />
        </div>
      </div>
    </div>
  );
};
