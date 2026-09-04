import React, { useState } from 'react';
import { LifeBuoy, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How does CitizenFirst AI decide which department handles my issue?',
    a: 'When you describe an issue, the AI classifies it and matches it to one or more departments based on the type of issue. If your report spans several categories — like waterlogging that also damaged a road — it is routed to every relevant department and tracked as one case.'
  },
  {
    q: 'What does the priority score mean?',
    a: 'Every case receives a transparent 0–100 score built from five visible factors: severity, how many citizens are affected, location risk, how long the issue has been open, and how frequently it is being reported. You can see the exact breakdown on any case page.'
  },
  {
    q: 'I already reported this — why does it say "consolidated"?',
    a: 'If another citizen reported the same issue nearby recently, CitizenFirst AI merges your report into that existing case instead of creating a duplicate, so departments see one prioritized issue instead of many overlapping tickets.'
  },
  {
    q: 'Do I need an account to report an issue?',
    a: 'No. You can submit a request without signing in. Creating an account lets you track all your requests in one place and get notified as they progress.'
  },
  {
    q: 'What happens after a department marks my issue resolved?',
    a: "You'll be asked to confirm whether it's actually fixed. If you say no, the case reopens automatically and returns to the department's queue."
  }
];

export default function HelpCenter() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 animate-fade-in">
      <div className="text-center mb-10">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <LifeBuoy size={20} />
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Help Center</h1>
        <p className="mt-2 text-ink-soft">Answers to common questions about CitizenFirst AI.</p>
      </div>

      <div className="rounded-card border border-border bg-bg divide-y divide-border">
        {FAQS.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-semibold text-ink">{f.q}</span>
              <ChevronDown size={16} className={`shrink-0 text-ink-faint transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-card border border-border bg-bg-subtle p-6 text-center">
        <p className="text-sm text-ink-soft mb-3">Still need help, or want to report an issue right now?</p>
        <Link to="/report" className="inline-flex px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
          Report a Request
        </Link>
      </div>
    </div>
  );
}
