import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-subtle mt-auto">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white font-bold text-xs">
              CF
            </span>
            <span className="font-bold text-ink text-sm">CitizenFirst AI</span>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            AI-powered government service interoperability. An SIH 2026 prototype (PS ID SIH26129) for the
            Government of Maharashtra.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            ['About CitizenFirst AI', '/about'],
            ['How It Works', '/how-it-works'],
            ['Interoperability Hub', '/interoperability'],
            ['GIS Intelligence', '/gis']
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ['Help Center', '/help'],
            ['Accessibility', '/profile'],
            ['Report a Request', '/report'],
            ['Track a Case', '/my-requests']
          ]}
        />
        <FooterCol
          title="Trust"
          links={[
            ['Privacy', '/help'],
            ['Security', '/help'],
            ['Contact', '/help']
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-content px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} CitizenFirst AI. All demonstration data is for illustration only.</span>
          <span className="font-medium px-2 py-0.5 rounded border border-border">SIH 2026 Prototype</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-ink-soft hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
