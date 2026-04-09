import { NavLink } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, ClipboardList, Gauge, GraduationCap, Home, MessageSquare, Settings, Users } from 'lucide-react';
import { cn } from '../lib/cn';

const roleNav = {
  student: [
    { to: '/student', label: 'Dashboard', icon: Home },
    { to: '/student/performance', label: 'Performance', icon: BarChart3 },
    { to: '/student/attendance', label: 'Attendance', icon: Gauge },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ],
  faculty: [
    { to: '/faculty', label: 'Dashboard', icon: Home },
    { to: '/faculty/marks', label: 'Add Marks', icon: BookOpen },
    { to: '/faculty/attendance', label: 'Attendance', icon: Gauge },
    { to: '/faculty/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/faculty/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/faculty/messages', label: 'Messages', icon: MessageSquare },
    { to: '/faculty/notifications', label: 'Notifications', icon: Bell },
    { to: '/faculty/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar({ role, onNavigate }) {
  const items = roleNav[role] || [];
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white px-3 py-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 px-2 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Academic LCA</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Curve Analyzer</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                )
              }
              end={it.to === `/${role}`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-2 pt-2 text-xs text-slate-500 dark:text-slate-400">v1.0 • Demo-ready</div>
    </aside>
  );
}
