import React, { useEffect, useState, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import { LoadingState, ErrorState } from '../components/LoadingState.jsx';
import { analyticsService } from '../services/analytics.js';

const SEVERITY_COLORS = { Critical: '#b3271e', High: '#a6600f', Medium: '#1c5f8c', Low: '#4a7a52' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const charts = await analyticsService.charts();
      setData(charts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-6"><LoadingState rows={5} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Analytics</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">{data.demoNotice}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Resolution rate" value={`${data.resolutionRate}%`} tone="resolved" />
        <StatCard label="Avg. resolution time" value={`${data.avgResolutionTimeHours}h`} />
        <StatCard label="SLA compliance" value={`${data.slaCompliancePercent}%`} />
        <StatCard label="Citizen satisfaction" value={`${data.citizenSatisfactionPercent}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Cases reported — last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.casesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1c6e8c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Severity distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.severityDistribution} dataKey="count" nameKey="severity" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.severityDistribution.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Department workload (open vs resolved)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.departmentWorkload}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="code" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="open" fill="#a6600f" radius={[4, 4, 0, 0]} name="Open" />
            <Bar dataKey="resolved" fill="#227a4d" radius={[4, 4, 0, 0]} name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="mt-6 rounded-card border border-border bg-bg p-5 text-sm text-ink-soft">
        Duplicate intelligence consolidated <span className="font-semibold text-ink">{data.duplicateReduction.totalRawReports}</span> raw
        reports into <span className="font-semibold text-ink">{data.duplicateReduction.masterCases}</span> master cases.
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-card border border-border bg-bg p-5">
      <h2 className="text-sm font-semibold text-ink mb-4">{title}</h2>
      {children}
    </div>
  );
}
