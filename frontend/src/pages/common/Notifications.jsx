import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { listNotifications, markNotificationRead } from '../../services/notifications';

function toneFor(type) {
  if (type === 'success') return 'success';
  if (type === 'warning') return 'warning';
  if (type === 'danger') return 'danger';
  return 'info';
}

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { items: list } = await listNotifications();
      setItems(list);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onRead(id) {
    try {
      await markNotificationRead(id);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update notification');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <div className="text-sm text-slate-500 dark:text-slate-400">System updates from marks, attendance, and assignments.</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">{items.filter((n) => !n.read).length} unread</div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n._id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{n.title}</div>
                  <Badge tone={toneFor(n.type)}>{n.type}</Badge>
                  {!n.read && <Badge tone="warning">new</Badge>}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.body}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <Button size="sm" variant="ghost" onClick={() => onRead(n._id)}>
                  Mark read
                </Button>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No notifications yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

