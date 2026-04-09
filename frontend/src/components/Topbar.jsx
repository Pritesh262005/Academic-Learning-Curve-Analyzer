import { Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';

export function Topbar({ role, onOpenMobileNav }) {
  const { user, logout } = useAuth();
  const notifPath = role === 'student' ? '/student/notifications' : role === 'faculty' ? '/faculty/notifications' : '/admin/notifications';

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="sm:hidden" onClick={onOpenMobileNav}>
          Menu
        </Button>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Signed in as <span className="font-medium text-slate-900 dark:text-slate-100">{user?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link to={notifPath}>
          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </Link>
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

