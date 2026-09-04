import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Network,
  ShieldCheck,
  Map,
  Users,
  Clock,
  CheckCircle2,
  MessageSquareText,
  Camera,
  Route
} from 'lucide-react';

const STEPS = [
  { icon: MessageSquareText, title: 'Describe the issue', body: 'Type or speak your issue in plain language, in English, Hindi or Marathi.' },
  { icon: Camera, title: 'AI understands it', body: 'CitizenFirst AI classifies the issue, checks severity, and detects if it spans multiple departments.' },
  { icon: Route, title: 'Routed automatically', body: 'Your request reaches the right department — or several — without you filling separate forms.' },
  { icon: CheckCircle2, title: 'Track to resolution', body: 'Follow every stage in real time and confirm once it is actually fixed.' }
];

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Understanding', body: 'Natural-language issue classification with transparent, explainable confidence — not a black box.' },
  { icon: Network, title: 'True Interoperability', body: 'One request can span Municipal, Road, Water and Safety departments and still be tracked as a single case.' },
  { icon: ShieldCheck, title: 'Explainable Prioritization', body: 'Every case gets a transparent 0–100 risk score built from severity, impact, and urgency — inspectable by any officer.' },
  { icon: Map, title: 'Live GIS Intelligence', body: 'City and department leaders see hotspots and emerging issues on a live map, not a spreadsheet.' }
];

export default function Landing() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="border-b border-border bg-bg-subtle">
        <div className="mx-auto max-w-content px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full mb-5">
              SIH 2026 · PS ID SIH26129 · Govt. of Maharashtra
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink leading-[1.08]">
              Namaste! Report and track civic issues.
              <span className="block text-primary">All in one place.</span>
            </h1>
            <p className="mt-5 text-lg text-ink-soft leading-relaxed max-w-xl">
              CitizenFirst AI reads what you write, understands the issue, and routes it to the right
              government department automatically — even when it spans more than one. No more filing the
              same complaint five times.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Report a Request <ArrowRight size={16} />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-border text-ink text-sm font-semibold hover:bg-bg transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><Users size={15} /> Built for every citizen</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> Track in real time</span>
            </div>
          </div>

          <div className="rounded-card border border-border bg-bg p-5 shadow-raised">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-critical" />
              <span className="h-2 w-2 rounded-full bg-high" />
              <span className="h-2 w-2 rounded-full bg-resolved" />
              <span className="ml-auto text-xs text-ink-faint font-mono">CFAI-MH-PUN-2026-004822</span>
            </div>
            <div className="rounded-md bg-primary-soft/50 border border-primary/20 p-4 mb-4">
              <p className="text-xs text-ink-faint mb-1">Citizen report</p>
              <p className="text-sm text-ink">
                "Severe waterlogging near a school, adjoining road also damaged."
              </p>
            </div>
            <div className="space-y-2.5">
              <MockRow label="Issue detected" value="Waterlogging + Road Damage" />
              <MockRow label="Routed to" value="Municipal Services, Road Infrastructure" />
              <MockRow label="Priority score" value="92/100 · Critical" tone="critical" />
              <MockRow label="Status" value="Field Inspection" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-content px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">How it works</h2>
        <p className="mt-2 text-ink-soft max-w-xl">From a plain-language report to a resolved case, in four steps.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-card border border-border bg-bg p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary mb-4">
                <s.icon size={18} />
              </span>
              <span className="text-xs font-semibold text-ink-faint">STEP {i + 1}</span>
              <h3 className="mt-1 text-sm font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-content px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Built for trust, not just speed</h2>
          <p className="mt-2 text-ink-soft max-w-xl">
            Every AI decision in CitizenFirst AI is explainable and reviewable by a human.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-card border border-border bg-bg p-5 flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal">
                  <f.icon size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-content px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Have an issue to report?
        </h2>
        <p className="mt-2 text-ink-soft">It takes less than two minutes, and you'll be able to track it end-to-end.</p>
        <Link
          to="/report"
          className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Report a Request <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

function MockRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-faint">{label}</span>
      <span className={`font-semibold ${tone === 'critical' ? 'text-critical' : 'text-ink'}`}>{value}</span>
    </div>
  );
}
