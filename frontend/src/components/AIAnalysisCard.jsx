import React from 'react';
import { Sparkles, MapPin, Building2, ArrowRight } from 'lucide-react';
import { DepartmentBadge } from './PriorityBadge.jsx';

export default function AIAnalysisCard({ analysis, title = 'AI Understanding' }) {
  if (!analysis) return null;
  return (
    <div className="rounded-card border border-primary/25 bg-primary-soft/40 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
          <Sparkles size={14} />
        </span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {analysis.isMockAnalysis && (
          <span className="ml-auto text-[11px] text-ink-faint border border-border rounded px-1.5 py-0.5">
            Prototype AI
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-ink-faint">Issue</dt>
          <dd className="font-semibold text-ink">{analysis.issueLabel || analysis.detected}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Confidence</dt>
          <dd className="font-semibold text-ink">{Math.round((analysis.confidence || 0) * 100)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Severity</dt>
          <dd className="font-semibold text-ink">{analysis.severity || analysis.potentialImpact}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Recommended action</dt>
          <dd className="font-semibold text-ink">{analysis.recommendedAction || 'Standard inspection'}</dd>
        </div>
      </dl>

      {analysis.departments && (
        <div className="mt-4">
          <dt className="text-xs text-ink-faint mb-1.5 flex items-center gap-1">
            <Building2 size={12} /> Potential services
          </dt>
          <div className="flex flex-wrap gap-1.5">
            {analysis.departments.map((d) => <DepartmentBadge key={d} code={d} />)}
          </div>
        </div>
      )}

      {analysis.crossDepartment && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-teal font-medium">
          <ArrowRight size={13} /> This spans multiple departments — CitizenFirst AI will coordinate them as one case.
        </div>
      )}
    </div>
  );
}
