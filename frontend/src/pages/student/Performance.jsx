import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { getMyMarks } from '../../services/students';

export function StudentPerformancePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const m = await getMyMarks();
        if (ignore) return;
        setData(m);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load performance');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const subjectBars = useMemo(() => {
    return (data?.subjectAverages || []).map((s) => ({ subject: s.subject, avg: s.averagePercent }));
  }, [data]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBars}>
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
          <CardTitle>Marks History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Assessment</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Percent</th>
                </tr>
              </thead>
              <tbody>
                {(data?.marks || []).slice().reverse().map((m, idx) => (
                  <tr key={idx} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-4">{new Date(m.date).toISOString().slice(0, 10)}</td>
                    <td className="py-2 pr-4">{m.subject}</td>
                    <td className="py-2 pr-4">{m.assessment}</td>
                    <td className="py-2 pr-4">
                      {m.score}/{m.maxScore}
                    </td>
                    <td className="py-2 pr-4">{Math.round((m.score / m.maxScore) * 1000) / 10}%</td>
                  </tr>
                ))}
                {(data?.marks || []).length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={5}>
                      No marks yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

