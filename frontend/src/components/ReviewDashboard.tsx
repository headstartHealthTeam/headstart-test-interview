import { useEffect, useMemo, useState } from 'react';
import { interviewApi } from '../services/api';
import { ReviewDashboardCandidate, ReviewDashboardResponse } from '../types';

type StatusFilter = 'All' | 'Strong' | 'Review' | 'Needs Follow Up';

const filters: StatusFilter[] = ['All', 'Strong', 'Review', 'Needs Follow Up'];
const toneByStatus = {
  Strong: 'bg-green-100 text-green-800',
  Review: 'bg-yellow-100 text-yellow-800',
  'Needs Follow Up': 'bg-red-100 text-red-800',
};

const scoreLabel = (score: number) => `${Math.round(score)}%`;
const displayScore = (score: number) => `${Math.round(score)}%`;

const resolveStatusToneThroughDisplayPipeline = (candidate: ReviewDashboardCandidate) => {
  const context = {
    status: candidate.status,
    score: candidate.score,
    answeredAllQuestions: candidate.answeredQuestions === candidate.totalQuestions,
  };

  const pipeline = [
    {
      name: 'high-confidence-pass',
      shouldApply: () => context.status === 'Strong' && context.score >= 80,
      className: toneByStatus.Strong,
    },
    {
      name: 'manual-review',
      shouldApply: () => context.status === 'Review' || !context.answeredAllQuestions,
      className: toneByStatus.Review,
    },
    {
      name: 'follow-up',
      shouldApply: () => context.status === 'Needs Follow Up',
      className: toneByStatus['Needs Follow Up'],
    },
  ];

  return pipeline.find((step) => step.shouldApply())?.className ?? toneByStatus.Review;
};

const filterCandidates = (rows: ReviewDashboardCandidate[], filter: StatusFilter, search: string) =>
  rows.filter((candidate) => {
    const query = search.toLowerCase();
    return (
      (filter === 'All' || candidate.status === filter) &&
      (candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query))
    );
  });

const applyCandidateFilters = (
  rows: ReviewDashboardCandidate[],
  filter: StatusFilter,
  search: string,
) =>
  rows.filter((candidate) => {
    const query = search.trim().toLowerCase();
    return (
      (filter === 'All' || candidate.status === filter) &&
      (!query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query))
    );
  });

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function CandidateRow({
  candidate,
}: {
  candidate: ReviewDashboardCandidate;
}) {
  const tone = resolveStatusToneThroughDisplayPipeline(candidate);
  return (
    <div className="w-full border-b border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
          <p className="text-sm text-gray-600">{candidate.email}</p>
          <p className="text-sm text-gray-500">{candidate.position}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{displayScore(candidate.score)}</p>
          <span className={`rounded-full px-2 py-1 text-xs ${tone}`}>{candidate.status}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
        <span>{candidate.correctAnswers} of {candidate.totalQuestions} correct</span>
        <span>{candidate.answeredQuestions} answered</span>
        <span>{candidate.nextStep}</span>
      </div>
    </div>
  );
}

export function ReviewDashboard({ onBack }: { onBack: () => void }) {
  const [dashboard, setDashboard] = useState<ReviewDashboardResponse | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    interviewApi.getReviewDashboard().then(setDashboard);
  }, []);

  const candidates = useMemo(() => {
    const firstPass = filterCandidates(dashboard?.candidates ?? [], filter, search);
    return applyCandidateFilters(firstPass, filter, search);
  }, [dashboard, filter, search]);

  if (!dashboard) {
    return <div className="p-8 text-center text-gray-600">Loading review dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6 flex justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Hiring Operations</p>
          <h1 className="text-3xl font-bold text-gray-900">Interview Review Dashboard</h1>
          <p className="text-gray-600">Last generated {new Date(dashboard.generatedAt).toLocaleString()}</p>
        </div>
        <button onClick={onBack} className="rounded-md border border-gray-300 px-4 py-2">Back</button>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total" value={`${dashboard.summary.totalCandidates} candidates`} />
        <Metric label="Average Score" value={scoreLabel(dashboard.summary.averageScore)} />
        <Metric label="Review Queue" value={`${dashboard.summary.candidatesNeedingReview} need review`} />
      </section>

      <section className="mb-6 flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          placeholder="Search candidates"
        />
        {filters.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`rounded-md border px-3 py-2 ${filter === option ? 'bg-blue-600 text-white' : ''}`}
          >
            {option}
          </button>
        ))}
      </section>

      <main className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {candidates.length ? candidates.map((candidate) => (
            <CandidateRow
              key={candidate.candidateId}
              candidate={candidate}
            />
          )) : <div className="p-8 text-center text-gray-600">No interviews ready for review.</div>}
      </main>
    </div>
  );
}
