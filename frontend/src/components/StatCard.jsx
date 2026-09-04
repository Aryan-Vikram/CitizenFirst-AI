import React from 'react';

export default function StatCard({ label, value, sublabel, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-ink',
    critical: 'text-critical',
    high: 'text-high',
    resolved: 'text-resolved'
  };
  return (
    <div className="rounded-card border border-border bg-bg p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-ink-soft uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-ink-faint" />}
      </div>
      <div className={`mt-2 text-2xl font-bold ${toneClasses[tone]}`}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-ink-faint">{sublabel}</div>}
    </div>
  );
}
