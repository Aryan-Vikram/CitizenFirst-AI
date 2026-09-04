import React from 'react';
import { Settings, Sun, Moon, Type, Contrast, Languages } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user } = useAuth();
  const {
    theme, toggleTheme, language, setLanguage,
    highContrast, setHighContrast, fontScale, setFontScale,
    simpleLanguage, setSimpleLanguage
  } = useApp();

  return (
    <div className="p-4 sm:p-6 max-w-xl animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={20} className="text-primary" />
        <h1 className="text-2xl font-bold text-ink tracking-tight">Profile & Accessibility</h1>
      </div>
      <p className="text-sm text-ink-soft mb-8">CitizenFirst AI is built to work for every citizen.</p>

      {user && (
        <div className="rounded-card border border-border bg-bg p-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-ink-faint">{user.email}</p>
            </div>
            <span className="ml-auto text-xs font-medium px-2 py-1 rounded-md bg-bg-subtle text-ink-soft capitalize">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-bg divide-y divide-border">
        <SettingRow icon={theme === 'light' ? Sun : Moon} title="Theme" desc="Switch between light and dark mode.">
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-md border border-border text-sm font-medium capitalize">
            {theme}
          </button>
        </SettingRow>

        <SettingRow icon={Languages} title="Language" desc="Interface and AI understanding language.">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-border text-sm bg-bg"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </SettingRow>

        <SettingRow icon={Contrast} title="High contrast" desc="Increase color contrast for readability.">
          <Toggle checked={highContrast} onChange={setHighContrast} />
        </SettingRow>

        <SettingRow icon={Type} title="Text size" desc="Scale text across the whole app.">
          <select
            value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            className="px-3 py-1.5 rounded-md border border-border text-sm bg-bg"
          >
            <option value={1}>Default</option>
            <option value={1.15}>Large</option>
            <option value={1.3}>Extra large</option>
          </select>
        </SettingRow>

        <SettingRow icon={Type} title="Simple language mode" desc="Slightly more spacing and plain phrasing.">
          <Toggle checked={simpleLanguage} onChange={setSimpleLanguage} />
        </SettingRow>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-subtle text-ink-soft">
        <Icon size={16} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-faint">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
