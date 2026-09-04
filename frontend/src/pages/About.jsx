import React from 'react';
import { Target, Users, Building2, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 animate-fade-in">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full mb-5">
        SIH 2026 · PS ID SIH26129 · Govt. of Maharashtra
      </span>
      <h1 className="text-3xl font-bold text-ink tracking-tight">About CitizenFirst AI</h1>
      <p className="mt-4 text-ink-soft leading-relaxed">
        Citizens today often have to identify which government department handles their issue, fill separate
        forms for problems that span multiple services, and follow up manually to know what happened next.
        CitizenFirst AI removes that burden: citizens describe an issue in plain language, and the platform
        understands it, routes it — sometimes to several departments at once — and keeps everyone updated
        until it's resolved.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <InfoCard icon={Target} title="The problem" body="Citizens juggle multiple portals and forms; departments work in silos with no shared, prioritized view of what matters most right now." />
        <InfoCard icon={Sparkles} title="The approach" body="An AI understanding layer classifies and routes every request, with a transparent priority score so humans can triage responsibly." />
        <InfoCard icon={Building2} title="For departments" body="A unified Command Center and Interoperability Hub give every department a live, explainable view of their workload." />
        <InfoCard icon={Users} title="For citizens" body="One place to report an issue in your language, track it, and confirm when it's genuinely fixed." />
      </div>

      <div className="mt-10 rounded-card border border-border bg-bg-subtle p-6 text-sm text-ink-soft leading-relaxed">
        <p className="font-semibold text-ink mb-1">A note on this build</p>
        This is a functional prototype built for Smart India Hackathon 2026. AI classification, computer-vision
        analysis, and department connections are simulated with clearly labelled mock logic so the full product
        experience can be demonstrated end-to-end; the architecture — a Node/Express API, a Python/FastAPI AI
        service, and a MongoDB-ready data layer — is designed to accept real models and live department
        integrations without changing how the frontend or API contracts work.
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }) {
  return (
    <div className="rounded-card border border-border bg-bg p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-soft text-teal mb-3">
        <Icon size={17} />
      </span>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}
