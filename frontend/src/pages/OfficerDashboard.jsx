import React, { useEffect, useState, useCallback } from 'react';
import { HardHat } from 'lucide-react';
import CaseCard from '../components/CaseCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.jsx';
import { casesService } from '../services/cases.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DEPARTMENT_NAMES } from '../utils/priorityScore.js';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await casesService.list({ department: user?.department, sortBy: 'priority' });
      setCases(data.cases.filter((c) => c.status !== 'Resolved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6"><LoadingState rows={4} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <HardHat size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Field Assignments</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Open cases for {DEPARTMENT_NAMES[user?.department] || 'your department'}, ranked by priority. Open a case to
        update its status and log evidence.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned" value={cases.length} />
        <StatCard label="Critical" value={cases.filter((c) => c.priorityBand === 'Critical').length} tone="critical" />
        <StatCard label="High" value={cases.filter((c) => c.priorityBand === 'High').length} tone="high" />
      </div>

      {cases.length === 0 ? (
        <EmptyState title="No open assignments" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {cases.map((c) => <CaseCard key={c.caseId} c={c} />)}
        </div>
      )}
    </div>
  );
}
