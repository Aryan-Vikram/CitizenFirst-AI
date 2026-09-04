import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, ListChecks, Bell, ArrowRight } from 'lucide-react';
import CaseCard from '../components/CaseCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.jsx';
import { casesService } from '../services/cases.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await casesService.list({ sortBy: 'recent' });
      setCases(data.cases.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = cases.filter((c) => c.status !== 'Resolved').length;
  const resolved = cases.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-sm text-ink-soft mt-1 mb-6">Here's what's happening with your requests.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active requests" value={active} icon={ListChecks} />
        <StatCard label="Resolved" value={resolved} tone="resolved" icon={ListChecks} />
        <Link to="/report" className="rounded-card border border-dashed border-primary/40 bg-primary-soft/30 p-5 flex flex-col items-center justify-center text-center hover:bg-primary-soft/50 transition-colors">
          <FilePlus2 size={20} className="text-primary mb-1.5" />
          <span className="text-sm font-semibold text-primary">Report a new request</span>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink">Recent requests</h2>
        <Link to="/my-requests" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {loading && <LoadingState rows={3} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && cases.length === 0 && (
        <EmptyState
          title="No requests yet"
          description="Report your first issue and CitizenFirst AI will route and track it for you."
          icon={Bell}
          action={<Link to="/report" className="text-sm font-semibold text-primary hover:underline">Report a request →</Link>}
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
