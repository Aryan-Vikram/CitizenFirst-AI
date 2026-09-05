import React, { useEffect, useState, useCallback } from 'react';
import {
  Network, CheckCircle2, AlertCircle, XCircle, MessageSquareText, Sparkles, ArrowRight,
  Building2, Route as RoadIcon, Droplet, Zap, Trash2, ShieldAlert
} from 'lucide-react';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { departmentsService } from '../services/departments.js';
import { timeAgo } from '../utils/format.js';

const STATUS_META = {
  connected: { icon: CheckCircle2, label: 'Working fine', className: 'text-resolved bg-resolved-soft' },
  degraded: { icon: AlertCircle, label: 'Slower than usual', className: 'text-high bg-high-soft' },
  offline: { icon: XCircle, label: 'Not responding', className: 'text-critical bg-critical-soft' }
};

const DEPT_ICONS = {
  MUN: Building2,
  ROAD: RoadIcon,
  WATER: Droplet,
  ELEC: Zap,
  SAN: Trash2,
  SAFETY: ShieldAlert
};

const PLACEHOLDER_DEPTS = [
  { code: 'MUN', name: 'Municipal Services' },
  { code: 'ROAD', name: 'Road Infrastructure' },
  { code: 'WATER', name: 'Water Services' },
  { code: 'ELEC', name: 'Electricity' },
  { code: 'SAN', name: 'Sanitation' },
  { code: 'SAFETY', name: 'Public Safety' }
];

const FLOW_STEPS = [
  {
    icon: MessageSquareText,
    title: 'You report one problem',
    body: 'Just once, in your own words — no need to know which office handles it.'
  },
  {
    icon: Sparkles,
    title: 'CitizenFirst AI reads it and decides who needs to know',
    body: 'This happens automatically, in seconds, using the same AI that scores urgency.'
  },
  {
    icon: Network,
    title: 'Every relevant department gets notified — at the same time',
    body: 'If your problem touches two offices (like a broken road causing waterlogging), both get it together, not one after another.'
  }
];

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
        This page shows how one complaint reaches multiple government offices without you having to contact each
        one yourself.
      </p>

      {/* Step-by-step flow, in plain words */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {FLOW_STEPS.map((s, i) => (
          <div key={s.title} className="relative rounded-card border border-border bg-bg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {i + 1}
              </span>
              <s.icon size={16} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-ink leading-snug">{s.title}</p>
            <p className="text-xs text-ink-faint mt-1.5 leading-relaxed">{s.body}</p>
            {i < FLOW_STEPS.length - 1 && (
              <ArrowRight size={16} className="hidden sm:block text-ink-faint absolute top-4 -right-2.5 z-10" />
            )}
          </div>
        ))}
      </div>

      {/* Visual result: which offices are on the receiving end */}
      <div className="rounded-card border border-border bg-bg-subtle p-5 mb-10">
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">
          These are the offices connected right now
        </p>
        <div className="flex flex-wrap gap-2">
          {(departments.length ? departments : PLACEHOLDER_DEPTS).map((d) => {
            const Icon = DEPT_ICONS[d.code] || Building2;
            return (
              <span
                key={d.code}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-ink"
              >
                <Icon size={13} className="text-primary" /> {d.name}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          No office needs to ask "did you get this too?" — CitizenFirst AI already told them.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-ink mb-2">Is each office actually online right now?</h2>
      <p className="text-sm text-ink-soft mb-6 max-w-2xl">
        Green means messages are going through normally. This updates automatically.
      </p>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 gap-4">
          {departments.map((d) => {
            const meta = STATUS_META[d.connectionStatus] || STATUS_META.connected;
            const StatusIcon = meta.icon;
            const DeptIcon = DEPT_ICONS[d.code] || Building2;
            return (
              <div key={d.code} className="rounded-card border border-border bg-bg p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <DeptIcon size={17} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{d.name}</h3>
                      <p className="text-xs text-ink-faint mt-0.5">{d.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${meta.className}`}>
                    <StatusIcon size={12} /> {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-ink-soft">
                  <span>{d.activeCases} open problem{d.activeCases === 1 ? '' : 's'}</span>
                  <span>Updated {timeAgo(d.lastSyncAt)}</span>
                </div>
                {d.isMockIntegration && (
                  <p className="mt-2 text-[11px] text-ink-faint">This connection is simulated for this demo.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
