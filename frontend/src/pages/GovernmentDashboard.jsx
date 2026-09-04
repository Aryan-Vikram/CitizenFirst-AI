import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, TrendingUp, Clock3, Network, Filter } from 'lucide-react';
import CaseCard from '../components/CaseCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.jsx';
import { casesService } from '../services/cases.js';
import { analyticsService } from '../services/analytics.js';

const BAND_FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function GovernmentDashboard() {
  const [queue, setQueue] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [band, setBand] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [q, o] = await Promise.all([casesService.priorityQueue(), analyticsService.overview()]);
      setQueue(q);
      setOverview(o);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6"><LoadingState rows={6} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  const filteredQueue = band === 'All' ? queue.queue : queue.queue.filter((c) => c.priorityBand === band);

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Government Command Center</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Live, AI-prioritized view across every department and city. Updated {new Date(queue.generatedAt).toLocaleTimeString('en-IN')}.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active cases" value={overview.activeCases} icon={Network} />
        <StatCard label="Critical priority" value={queue.bands.Critical || 0} tone="critical" icon={ShieldAlert} />
        <StatCard label="SLA breaches" value={queue.slaBreaches} tone="high" icon={Clock3} />
        <StatCard label="Resolved to date" value={overview.resolvedCases} tone="resolved" icon={TrendingUp} />
      </div>

      <div className="rounded-card border border-border bg-bg">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-ink">Priority Queue — {queue.totalOpen} open cases</h2>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-ink-faint" />
            {BAND_FILTERS.map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  band === b ? 'bg-primary text-white' : 'text-ink-soft border border-border hover:bg-bg-subtle'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[720px] overflow-y-auto">
          {filteredQueue.length === 0 ? (
            <EmptyState title="No cases in this band" description="Try a different priority filter." />
          ) : (
            filteredQueue.map((c) => <CaseCard key={c.caseId} c={c} />)
          )}
        </div>
      </div>
    </div>
  );
}
