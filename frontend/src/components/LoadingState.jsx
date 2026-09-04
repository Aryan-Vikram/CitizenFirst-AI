import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function LoadingState({ rows = 3, label = 'Loading…' }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-card border border-border skeleton" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry, secondaryAction }) {
  return (
    <div className="rounded-card border border-border bg-bg-subtle p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-critical-soft text-critical">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm font-medium text-ink mb-1">
        {message || 'Government service temporarily unavailable.'}
      </p>
      <p className="text-sm text-ink-soft mb-4">Your request has been safely queued. You can retry now.</p>
      <div className="flex items-center justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-dark"
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = Inbox }) {
  return (
    <div className="rounded-card border border-dashed border-border p-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-subtle text-ink-faint">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold text-ink mb-1">{title}</p>
      {description && <p className="text-sm text-ink-soft mb-4 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}
