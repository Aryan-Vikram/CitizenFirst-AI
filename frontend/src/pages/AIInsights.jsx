import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, TrendingUp, Copy, Building2, Flame } from 'lucide-react';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { aiService } from '../services/ai.js';

const KIND_ICON = { trend: TrendingUp, duplicate: Copy, workload: Building2, hotspot: Flame };

export default function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const insights = await aiService.insights();
      setData(insights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 sm:p-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">AI Insights</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">Plain-language summaries generated from case activity across departments.</p>

      {loading && <LoadingState rows={5} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-3">
          {data.items.map((item, i) => {
            const Icon = KIND_ICON[item.kind] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 rounded-card border border-border bg-bg p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon size={15} />
                </span>
                <p className="text-sm text-ink pt-1">{item.text}</p>
              </div>
            );
          })}
          <p className="text-xs text-ink-faint pt-2">{data.notice}</p>
        </div>
      )}
    </div>
  );
}
