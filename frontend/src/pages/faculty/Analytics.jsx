import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getClassAverage, getTopperList, getWeakStudents } from '../../services/analytics';

function downloadCsv(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(',');
  const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function FacultyAnalyticsPage() {
  const [avg, setAvg] = useState(null);
  const [toppers, setToppers] = useState([]);
  const [weak, setWeak] = useState([]);
  const [threshold, setThreshold] = useState('45');

  const load = useCallback(async () => {
    try {
      const [a, t, w] = await Promise.all([
        getClassAverage(),
        getTopperList({ limit: 10 }),
        getWeakStudents({ limit: 50, threshold: Number(threshold) }),
      ]);
      setAvg(a);
      setToppers(t.items || []);
      setWeak(w.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load analytics');
    }
  }, [threshold]);

  useEffect(() => {
    load();
  }, [load]);

  const bars = useMemo(() => {
    return (avg?.subjectAverages || []).map((s) => ({ subject: s.subject, avg: s.averagePercent }));
  }, [avg]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Class Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
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
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Overall</div>
              <div className="text-3xl font-semibold">{avg?.overallAverage || 0}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Students</div>
              <div className="font-medium">{avg?.countStudents || 0}</div>
              <Button variant="outline" size="sm" onClick={load}>
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Rank</th>
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {toppers.map((t) => (
                    <tr key={t.rank} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="py-2 pr-4">#{t.rank}</td>
                      <td className="py-2 pr-4">{t.user?.name || '—'}</td>
                      <td className="py-2 pr-4">
                        <Badge tone="success">{t.overall}%</Badge>
                      </td>
                    </tr>
                  ))}
                  {toppers.length === 0 && (
                    <tr>
                      <td className="py-4 text-slate-500" colSpan={3}>
                        No data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak Students</CardTitle>
            <div className="flex items-center gap-2 pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Threshold</div>
              <Input className="h-9 w-24" value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" min="1" max="100" />
              <Button size="sm" variant="outline" onClick={load}>
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  weak.length
                    ? downloadCsv('weak_students.csv', weak.map((w) => ({ name: w.user?.name || '', email: w.user?.email || '', overall: w.overall })))
                    : toast('No rows to export')
                }
              >
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weak.map((w) => (
                <div key={w.user?.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div>
                    <div className="font-medium">{w.user?.name || '—'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{w.user?.email || ''}</div>
                  </div>
                  <Badge tone="warning">{w.overall}%</Badge>
                </div>
              ))}
              {weak.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  No weak students detected (or no marks data).
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
