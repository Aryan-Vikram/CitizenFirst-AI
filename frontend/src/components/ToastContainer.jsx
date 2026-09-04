import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };
const STYLES = {
  success: 'border-resolved/30 bg-resolved-soft text-resolved',
  error: 'border-critical/30 bg-critical-soft text-critical',
  info: 'border-primary/30 bg-primary-soft text-primary'
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[min(360px,90vw)]" role="region" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind] || Info;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-md border px-4 py-3 shadow-raised animate-fade-in ${STYLES[t.kind] || STYLES.info}`}
          >
            <Icon size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
