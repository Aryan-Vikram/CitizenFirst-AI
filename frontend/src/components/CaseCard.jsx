import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge.jsx';
import { DepartmentBadge } from './PriorityBadge.jsx';
import { timeAgo } from '../utils/format.js';

export default function CaseCard({ c }) {
  return (
    <Link
      to={`/case/${encodeURIComponent(c.caseId)}`}
      className="block rounded-card border border-border bg-bg p-4 hover:border-primary/50 hover:shadow-panel transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-ink-faint">{c.caseId}</span>
            {c.isDuplicateCluster && (
              <span className="text-[11px] font-medium text-teal bg-teal-soft px-1.5 py-0.5 rounded">
                {c.citizenReports} reports consolidated
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-ink truncate">{c.title}</h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-soft flex-wrap">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {c.city}{c.ward ? `, ${c.ward}` : ''}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {c.citizenReports} report{c.citizenReports === 1 ? '' : 's'}
            </span>
            <span>{timeAgo(c.firstReportedAt)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {c.departments?.map((d) => <DepartmentBadge key={d} code={d} />)}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <PriorityBadge band={c.priorityBand} score={c.priorityScore} />
          <span className="text-xs text-ink-soft">{c.status}</span>
        </div>
      </div>
    </Link>
  );
}
