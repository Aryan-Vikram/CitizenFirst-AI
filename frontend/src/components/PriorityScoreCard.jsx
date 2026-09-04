import React from 'react';
import { Info } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge.jsx';

const FACTOR_LABELS = {
  severity: 'Severity',
  citizensAffected: 'Citizens affected',
  locationRisk: 'Location risk',
  duration: 'Duration open',
  reportFrequency: 'Report frequency'
};

export default function PriorityScoreCard({ score, band, factors }) {
  if (!factors) return null;
  return (
    <div className="rounded-card border border-border bg-bg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Priority Score</h3>
        <PriorityBadge band={band} score={score} />
      </div>

      <div className="space-y-3">
        {Object.entries(factors).map(([key, f]) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-ink-soft">{FACTOR_LABELS[key] || key}</span>
              <span className="text-ink-faint">{f.points}/{f.max}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-bg-subtle overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${f.max ? (f.points / f.max) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink-faint">{f.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-bg-subtle p-3 text-xs text-ink-soft">
        <Info size={14} className="shrink-0 mt-0.5 text-ink-faint" />
        <span>
          Priority is calculated from transparent factors to support human decision-making. A department
          administrator can always override this score.
        </span>
      </div>
    </div>
  );
}
