import React from 'react';
import { Check } from 'lucide-react';
import { STATUS_ORDER, statusIndex } from '../utils/priorityScore.js';
import { formatDate } from '../utils/format.js';

export default function CaseTimeline({ status, timeline = [] }) {
  const currentIdx = statusIndex(status);
  const timelineByStage = Object.fromEntries(timeline.map((t) => [t.stage, t]));

  return (
    <ol className="relative">
      {STATUS_ORDER.map((stage, i) => {
        const done = i <= currentIdx;
        const entry = timelineByStage[stage];
        const isLast = i === STATUS_ORDER.length - 1;
        return (
          <li key={stage} className="relative pl-9 pb-7 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${done ? 'bg-primary' : 'bg-border'}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                done ? 'bg-primary' : 'bg-border text-ink-faint'
              }`}
            >
              {done ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className={`text-sm font-semibold ${done ? 'text-ink' : 'text-ink-faint'}`}>{stage}</div>
            {entry ? (
              <div className="mt-0.5 text-xs text-ink-soft">
                {entry.note && <span>{entry.note}. </span>}
                {formatDate(entry.at)}
              </div>
            ) : done ? null : (
              <div className="mt-0.5 text-xs text-ink-faint">Pending</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
