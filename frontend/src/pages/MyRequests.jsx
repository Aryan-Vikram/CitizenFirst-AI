import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, FilePlus2 } from 'lucide-react';
import CaseCard from '../components/CaseCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.jsx';
import { casesService } from '../services/cases.js';

export default function MyRequests() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async (query) => {
    setLoading(true);
    setError('');
    try {
      const data = await casesService.list({ q: query, sortBy: 'recent' });
      setCases(data.cases);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(''); }, [load]);

  function handleSearch(e) {
    e.preventDefault();
    load(q);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">My Requests</h1>
          <p className="text-sm text-ink-soft mt-1">Track every case you've reported, in one place.</p>
        </div>
        <Link to="/report" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
          <FilePlus2 size={15} /> New request
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by case ID, issue, city or status…"
          className="w-full rounded-md border border-border pl-9 pr-3 py-2.5 text-sm bg-bg text-ink"
        />
      </form>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={() => load(q)} />}
      {!loading && !error && cases.length === 0 && (
        <EmptyState
          title="No requests found"
          description="Once you report an issue, it will show up here with real-time tracking."
          action={<Link to="/report" className="text-sm font-semibold text-primary hover:underline">Report your first request →</Link>}
        />
      )}
      {!loading && !error && cases.length > 0 && (
        <div className="space-y-3">
          {cases.map((c) => <CaseCard key={c.caseId} c={c} />)}
        </div>
      )}
    </div>
  );
}
