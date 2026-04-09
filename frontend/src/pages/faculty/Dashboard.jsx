import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getClassAverage, getTopperList, getWeakStudents } from '../../services/analytics';

export function FacultyDashboard() {
  const [avg, setAvg] = useState(null);
  const [toppers, setToppers] = useState([]);
  const [weak, setWeak] = useState([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [a, t, w] = await Promise.all([getClassAverage(), getTopperList({ limit: 5 }), getWeakStudents({ limit: 5 })]);
        if (ignore) return;
        setAvg(a);
        setToppers(t.items || []);
        setWeak(w.items || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load dashboard');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const bars = useMemo(() => {
    return (avg?.subjectAverages || []).slice().reverse().map((s) => ({ subject: s.subject, avg: s.averagePercent }));
  }, [avg]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{avg?.overallAverage || 0}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Across all marks</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Topper (Now)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {toppers[0]?.user?.name ? (
                <>
                  <span className="font-medium">{toppers[0].user.name}</span> • {toppers[0].overall}%
                </>
              ) : (
                'No data yet'
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weak Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{weak.length}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Below threshold</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Averages</CardTitle>
            <div className="text-sm text-slate-500 dark:text-slate-400">Class-wide subject performance</div>
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
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
              <div className="font-medium">Leaderboard</div>
              <div className="mt-2 space-y-1">
                {toppers.map((t) => (
                  <div key={t.rank} className="flex items-center justify-between">
                    <div className="text-slate-700 dark:text-slate-200">
                      #{t.rank} {t.user?.name || '—'}
                    </div>
                    <Badge tone="success">{t.overall}%</Badge>
                  </div>
                ))}
                {toppers.length === 0 && <div className="text-slate-500 dark:text-slate-400">No data yet.</div>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
              <div className="font-medium">Needs Attention</div>
              <div className="mt-2 space-y-1">
                {weak.map((w) => (
                  <div key={w.user?.id} className="flex items-center justify-between">
                    <div className="text-slate-700 dark:text-slate-200">{w.user?.name || '—'}</div>
                    <Badge tone="warning">{w.overall}%</Badge>
                  </div>
                ))}
                {weak.length === 0 && <div className="text-slate-500 dark:text-slate-400">None detected.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

