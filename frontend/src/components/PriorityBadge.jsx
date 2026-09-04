import React from 'react';
import { bandStyle, DEPARTMENT_NAMES } from '../utils/priorityScore.js';

export function PriorityBadge({ band, score }) {
  const s = bandStyle(band);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {band}
      {typeof score === 'number' && <span className="opacity-70 font-normal">· {score}/100</span>}
    </span>
  );
}

export function DepartmentBadge({ code }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded border border-border text-[11px] font-medium text-ink-soft bg-bg">
      {DEPARTMENT_NAMES[code] || code}
    </span>
  );
}
