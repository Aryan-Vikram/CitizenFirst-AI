import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressSteps({ steps, currentStep }) {
  return (
    <ol className="flex items-center w-full mb-8" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const isLast = i === steps.length - 1;
        return (
          <li key={label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-primary text-white'
                    : active
                    ? 'border-2 border-primary text-primary'
                    : 'border border-border text-ink-faint'
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </span>
              <span className={`text-[11px] font-medium text-center max-w-[76px] ${active || done ? 'text-ink' : 'text-ink-faint'}`}>
                {label}
              </span>
            </div>
            {!isLast && <span className={`flex-1 h-px mx-2 ${done ? 'bg-primary' : 'bg-border'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
