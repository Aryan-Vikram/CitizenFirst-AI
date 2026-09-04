import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ClipboardList, Info, MapPinned } from 'lucide-react';
import { timeAgo } from '../utils/format.js';

const ICONS = {
  assigned: ClipboardList,
  inspection: MapPinned,
  info_requested: Info,
  resolved: CheckCircle2,
  confirm_resolution: CheckCircle2,
  system: Bell
};

export default function NotificationPanel({ notifications = [], onMarkRead }) {
  if (!notifications.length) {
    return <p className="text-sm text-ink-soft py-6 text-center">You're all caught up — no notifications.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {notifications.map((n) => {
        const Icon = ICONS[n.type] || Bell;
        return (
          <li key={n.id} className={`flex items-start gap-3 py-3.5 ${n.read ? 'opacity-60' : ''}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{n.message}</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-xs text-ink-faint">{timeAgo(n.createdAt)}</span>
                {n.caseId && (
                  <Link to={`/case/${encodeURIComponent(n.caseId)}`} className="text-xs font-medium text-primary hover:underline">
                    View case
                  </Link>
                )}
                {!n.read && onMarkRead && (
                  <button onClick={() => onMarkRead(n.id)} className="text-xs font-medium text-ink-soft hover:text-ink">
                    Mark read
                  </button>
                )}
              </div>
            </div>
            {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" aria-label="Unread" />}
          </li>
        );
      })}
    </ul>
  );
}
