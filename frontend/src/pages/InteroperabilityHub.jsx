import React, { useEffect, useState, useCallback } from 'react';
import { Network, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { departmentsService } from '../services/departments.js';
import { timeAgo } from '../utils/format.js';

const STATUS_META = {
  connected: { icon: CheckCircle2, label: 'Connected', className: 'text-resolved bg-resolved-soft' },
  degraded: { icon: AlertCircle, label: 'Degraded', className: 'text-high bg-high-soft' },
  offline: { icon: XCircle, label: 'Offline', className: 'text-critical bg-critical-soft' }
};

export default function InteroperabilityHub() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentsService.list();
      setDepartments(data.departments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Network size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Interoperability Hub</h1>
      </div>
      <p className="text-sm text-ink-soft mb-8 max-w-2xl">
        CitizenFirst AI acts as a single connective layer across government departments, so one citizen request can
        reach several services at once without separate portals or forms.
      </p>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 gap-4">
          {departments.map((d) => {
            const meta = STATUS_META[d.connectionStatus] || STATUS_META.connected;
            const Icon = meta.icon;
            return (
              <div key={d.code} className="rounded-card border border-border bg-bg p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{d.name}</h2>
                    <p className="text-xs text-ink-faint mt-0.5">{d.description}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${meta.className}`}>
                    <Icon size={12} /> {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-ink-soft">
                  <span>{d.activeCases} active case(s)</span>
                  <span>Synced {timeAgo(d.lastSyncAt)}</span>
                </div>
                {d.isMockIntegration && (
                  <p className="mt-2 text-[11px] text-ink-faint">Simulated integration for this prototype.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
