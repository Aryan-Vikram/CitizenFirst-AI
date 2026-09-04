import React, { useEffect, useState, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import CaseCard from '../components/CaseCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState.jsx';
import { departmentsService } from '../services/departments.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DEPARTMENT_NAMES } from '../utils/priorityScore.js';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const code = user?.department || 'ROAD';
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentsService.workload(code);
      setWorkload(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6"><LoadingState rows={5} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Building2 size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">{DEPARTMENT_NAMES[code] || code} Dashboard</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">Cases assigned or routed to your department, ranked by priority.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total open" value={workload.total} />
        <StatCard label="Critical" value={workload.critical} tone="critical" />
        <StatCard label="High" value={workload.high} tone="high" />
        <StatCard label="Medium + Low" value={workload.medium + workload.low} />
      </div>

      <h2 className="text-sm font-semibold text-ink mb-4">Case queue</h2>
      {workload.cases.length === 0 ? (
        <EmptyState title="No cases yet" description="New routed cases will appear here automatically." />
      ) : (
        <div className="space-y-3">
          {workload.cases.map((c) => <CaseCard key={c.caseId} c={c} />)}
        </div>
      )}
    </div>
  );
}
