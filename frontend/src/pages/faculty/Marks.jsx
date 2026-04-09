import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { addMarks, listStudents } from '../../services/students';

export function FacultyMarksPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [assessment, setAssessment] = useState('Internal');
  const [score, setScore] = useState('0');
  const [maxScore, setMaxScore] = useState('100');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { items } = await listStudents({ limit: 100 });
        if (ignore) return;
        setStudents(items || []);
        setStudentId((items?.[0]?.id) || '');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!studentId) return toast.error('Select a student');
    setSaving(true);
    try {
      await addMarks(studentId, {
        subject,
        assessment,
        score: Number(score),
        maxScore: Number(maxScore),
        date,
      });
      toast.success('Marks added');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add marks');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Marks</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Faculty-only action.</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Student</div>
              <Select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={loading}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Subject</div>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Assessment</div>
                <Input value={assessment} onChange={(e) => setAssessment(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Score</div>
                <Input value={score} onChange={(e) => setScore(e.target.value)} type="number" min="0" required />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Max score</div>
                <Input value={maxScore} onChange={(e) => setMaxScore(e.target.value)} type="number" min="1" required />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Date</div>
                <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
              </div>
            </div>
            <Button disabled={saving} type="submit">
              {saving ? 'Saving…' : 'Add marks'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

