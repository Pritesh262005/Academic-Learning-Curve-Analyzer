import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { listAssignments } from '../../services/assignments';
import { getMyAttendance } from '../../services/attendance';
import { getMySuggestions } from '../../services/analytics';
import { getMyMarks } from '../../services/students';

function toDateLabel(d) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function StudentDashboard() {
  const [marks, setMarks] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [m, a, s, asg] = await Promise.all([getMyMarks(), getMyAttendance(), getMySuggestions(), listAssignments()]);
        if (ignore) return;
        setMarks(m);
        setAttendance(a);
        setSuggestions(s);
        setAssignments(asg);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load dashboard');
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const trend = useMemo(() => {
    const items = marks?.marks || [];
    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((m, idx) => ({
      name: toDateLabel(m.date) || `${idx + 1}`,
      percent: Math.round((m.score / m.maxScore) * 1000) / 10,
    }));
  }, [marks]);

  const subjectBars = useMemo(() => {
    return (marks?.subjectAverages || []).map((s) => ({ subject: s.subject, avg: s.averagePercent }));
  }, [marks]);

  const overall = marks?.overallAverage || 0;
  const attendancePct = attendance?.percentage || 0;
  const predicted = suggestions?.predictedOverall || 0;
  const pendingAssignments = (assignments?.items || []).filter((a) => a.status !== 'graded').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{overall}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Average across marks</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{attendancePct}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Presence rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{predicted}%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Next overall estimate</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pendingAssignments}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Pending grading</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <div className="text-sm text-slate-500 dark:text-slate-400">Latest submissions over time</div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" hide={trend.length > 7} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Comparison</CardTitle>
            <div className="text-sm text-slate-500 dark:text-slate-400">Average percent per subject</div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weak Subject Suggestions</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Logic-based improvement plan</div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(suggestions?.weakSubjects || []).length === 0 ? (
              <Badge tone="success">No weak subjects detected</Badge>
            ) : (
              suggestions?.weakSubjects?.map((s) => (
                <Badge key={s.subject} tone="warning">
                  {s.subject} • {s.averagePercent}%
                </Badge>
              ))
            )}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(suggestions?.studyPlan || []).map((p) => (
              <div key={p.subject} className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                <div className="font-medium">{p.subject}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">{p.recommendation}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

