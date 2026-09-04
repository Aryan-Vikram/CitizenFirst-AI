import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Citizen', email: 'citizen@demo.citizenfirst.ai', role: 'citizen' },
  { label: 'Field Officer', email: 'officer@demo.citizenfirst.ai', role: 'field_officer' },
  { label: 'Department Admin', email: 'dept.admin@demo.citizenfirst.ai', role: 'department_admin' },
  { label: 'Government Admin', email: 'gov.admin@demo.citizenfirst.ai', role: 'government_admin' }
];

const REDIRECT_BY_ROLE = {
  citizen: '/dashboard',
  field_officer: '/officer',
  department_admin: '/department',
  government_admin: '/command-center'
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { pushToast } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      pushToast(`Welcome back, ${user.name.split(' ')[0]}.`, 'success');
      navigate(REDIRECT_BY_ROLE[user.role] || '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24 animate-fade-in">
      <div className="text-center mb-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white font-bold mb-4">
          CF
        </span>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Sign in to CitizenFirst AI</h1>
        <p className="mt-1 text-sm text-ink-soft">Track your requests or manage your department's cases.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-card border border-border bg-bg p-6 space-y-4">
        {error && <p className="text-sm text-critical bg-critical-soft rounded-md p-3">{error}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2.5 text-sm bg-bg text-ink"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2.5 text-sm bg-bg text-ink"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
        >
          <LogIn size={15} /> {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 rounded-card border border-dashed border-border p-4">
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2.5">
          Demo accounts (password: demo1234)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => { setEmail(a.email); setPassword('demo1234'); }}
              className="text-left px-3 py-2 rounded-md border border-border text-xs hover:border-primary/50 hover:bg-primary-soft/40"
            >
              <span className="block font-semibold text-ink">{a.label}</span>
              <span className="block text-ink-faint truncate">{a.email}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Prefer to report anonymously? <Link to="/report" className="text-primary font-medium hover:underline">Report a request</Link> without signing in.
      </p>
    </div>
  );
}
