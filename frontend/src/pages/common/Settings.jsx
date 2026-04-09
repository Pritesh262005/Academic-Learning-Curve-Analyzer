import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Name</div>
            <div className="font-medium">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Role</div>
            <div className="font-medium">{user?.role}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-slate-500 dark:text-slate-400">Toggle light/dark mode</div>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}

