import React, { useEffect, useState, useCallback } from 'react';
import { Map as MapIcon, Flame } from 'lucide-react';
import MapView, { MapLegend } from '../components/MapView.jsx';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { casesService } from '../services/cases.js';
import { aiService } from '../services/ai.js';

export default function GISIntelligence() {
  const [cases, setCases] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [c, h] = await Promise.all([casesService.list({ sortBy: 'priority' }), aiService.hotspots()]);
      setCases(c.cases);
      setHotspots(h.hotspots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6"><LoadingState rows={5} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  const cities = ['All', ...new Set(cases.map((c) => c.city))];
  const filtered = cityFilter === 'All' ? cases : cases.filter((c) => c.city === cityFilter);

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <MapIcon size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">GIS Intelligence</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">Every active case plotted by location, color-coded by AI priority.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm bg-bg text-ink"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <MapLegend />
          </div>
          <MapView cases={filtered} height={560} zoom={7} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Flame size={15} className="text-high" /> Emerging hotspots
          </h2>
          <div className="space-y-3">
            {hotspots.length === 0 && (
              <p className="text-sm text-ink-soft">No emerging clusters detected right now.</p>
            )}
            {hotspots.map((h) => (
              <div key={`${h.city}-${h.ward}-${h.issueType}`} className="rounded-card border border-border bg-bg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{h.issueLabel}</span>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      h.risk === 'High' ? 'bg-critical-soft text-critical' : h.risk === 'Medium' ? 'bg-high-soft text-high' : 'bg-low-soft text-low'
                    }`}
                  >
                    {h.risk}
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1">{h.ward || 'Multiple wards'}, {h.city}</p>
                <p className="text-xs text-ink-faint mt-1.5">
                  {h.count} reports · up {h.trendPercent}% · {h.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
