import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, Sparkles, Network, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

const FLOW = [
  {
    icon: MessageSquareText,
    title: '1. Describe the issue',
    body: 'Type — or speak — what\'s wrong, in English, Hindi or Marathi. No forms, no department names to guess.'
  },
  {
    icon: Sparkles,
    title: '2. AI understands it',
    body: 'CitizenFirst AI classifies the issue type, estimates severity, and checks whether it touches more than one department — like waterlogging that also damages a road.'
  },
  {
    icon: Network,
    title: '3. Routed — even across departments',
    body: 'Your request reaches every relevant department automatically and is tracked as a single case, so you never file the same thing twice.'
  },
  {
    icon: ShieldCheck,
    title: '4. Prioritized transparently',
    body: 'A 0–100 priority score is calculated from severity, citizens affected, location risk, how long it has been open, and report frequency. Every point is explained, and a human can always override it.'
  },
  {
    icon: MapPin,
    title: '5. Visible on a live map',
    body: 'Department and city leaders see every open case plotted geographically, with emerging hotspots flagged automatically.'
  },
  {
    icon: CheckCircle2,
    title: '6. You confirm the resolution',
    body: 'When a department marks a case resolved, you get asked directly — if it isn\'t actually fixed, the case reopens.'
  }
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 animate-fade-in">
      <h1 className="text-3xl font-bold text-ink tracking-tight text-center">How CitizenFirst AI works</h1>
      <p className="mt-3 text-ink-soft text-center max-w-xl mx-auto">
        From a plain-language report to a confirmed resolution — every step is visible to you.
      </p>

      <div className="mt-12 space-y-8">
        {FLOW.map((s) => (
          <div key={s.title} className="flex gap-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <s.icon size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Link to="/report" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
          Report a Request <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
