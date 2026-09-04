import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/interoperability', label: 'Interoperability Hub' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help Center' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme, language, setLanguage } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="CitizenFirst AI home">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white font-bold text-sm">
            CF
          </span>
          <span className="text-[15px] font-bold tracking-tight text-ink">CitizenFirst AI</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {PUBLIC_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select language"
            className="text-sm border border-border rounded-md px-2 py-1.5 bg-bg text-ink-soft"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-md border border-border text-ink-soft hover:text-ink"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <UserMenu user={user} onLogout={() => { logout(); navigate('/'); }} />
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <Link
                to="/report"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Report a Request
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-bg px-4 py-4 space-y-1 animate-fade-in">
          {PUBLIC_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-ink hover:bg-bg-subtle"
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 flex gap-2">
            {user ? (
              <button
                onClick={() => { logout(); setOpen(false); navigate('/'); }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-md border border-border text-ink"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-md border border-border text-ink"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/report"
              onClick={() => setOpen(false)}
              className="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-md bg-primary text-white"
            >
              Report a Request
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dashboardPath = {
    citizen: '/dashboard',
    field_officer: '/officer',
    department_admin: '/department',
    government_admin: '/command-center'
  }[user.role] || '/dashboard';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-ink"
      >
        <span className="h-6 w-6 rounded-full bg-primary-soft text-primary text-xs font-bold flex items-center justify-center">
          {user.name.charAt(0)}
        </span>
        {user.name.split(' ')[0]}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-bg shadow-raised py-1 animate-fade-in">
          <Link to={dashboardPath} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-bg-subtle">
            Dashboard
          </Link>
          <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-bg-subtle">
            Profile & Accessibility
          </Link>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-bg-subtle">
            Notifications
          </Link>
          <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-critical hover:bg-critical-soft">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
