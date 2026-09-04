import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Map,
  Network,
  BarChart3,
  Bell,
  Settings,
  Building2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const NAV_BY_ROLE = {
  citizen: [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Report a Request', icon: FilePlus2 },
    { to: '/my-requests', label: 'My Requests', icon: ListChecks },
    { to: '/gis', label: 'GIS Intelligence', icon: Map },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile & Accessibility', icon: Settings }
  ],
  field_officer: [
    { to: '/officer', label: 'Assigned Cases', icon: ListChecks },
    { to: '/gis', label: 'GIS Intelligence', icon: Map },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile & Accessibility', icon: Settings }
  ],
  department_admin: [
    { to: '/department', label: 'Department Dashboard', icon: Building2 },
    { to: '/gis', label: 'GIS Intelligence', icon: Map },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile & Accessibility', icon: Settings }
  ],
  government_admin: [
    { to: '/command-center', label: 'Command Center', icon: ShieldCheck },
    { to: '/gis', label: 'GIS Intelligence', icon: Map },
    { to: '/interoperability', label: 'Interoperability Hub', icon: Network },
    { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile & Accessibility', icon: Settings }
  ]
};

export default function Sidebar({ role = 'citizen' }) {
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.citizen;

  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-border bg-bg-subtle py-6 px-3">
      <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-soft text-primary' : 'text-ink-soft hover:bg-bg hover:text-ink'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
