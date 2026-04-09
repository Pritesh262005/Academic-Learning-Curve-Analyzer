import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getClassAverage, getTopperList } from '../../services/analytics';
import { listUsers } from '../../services/users';

export function AdminDashboard() {
  const [avg, setAvg] = useState(null);
  const [toppers, setToppers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [a, t, u] = await Promise.all([getClassAverage(), getTopperList({ limit: 5 }), listUsers({ limit: 200 })]);
        if (ignore) return;
        setAvg(a);
        setToppers(t.items || []);
        setUsers(u.items || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load admin dashboard');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { admin: 0, faculty: 0, student: 0 };
    users.forEach((u) => {
      if (c[u.role] !== undefined) c[u.role] += 1;
    });
    return c;
  }, [users]);

  const bars = useMemo(() => {
    return (avg?.subjectAverages || []).map((s) => ({ subject: s.subject, avg: s.averagePercent }));
  }, [avg]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{counts.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{counts.faculty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{counts.student}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Class Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{avg?.overallAverage || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topper Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {toppers.map((t) => (
              <div key={t.rank} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <div className="font-medium">{t.user?.name || '—'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">#{t.rank}</div>
                </div>
                <Badge tone="success">{t.overall}%</Badge>
              </div>
            ))}
            {toppers.length === 0 && <div className="text-slate-500 dark:text-slate-400">No data yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

