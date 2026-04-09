import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { listStudents } from '../../services/students';
import { markAttendance } from '../../services/attendance';

export function FacultyAttendancePage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('present');
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
      await markAttendance(studentId, { date, status });
      toast.success('Attendance updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
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
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Date</div>
                <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Status</div>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </Select>
              </div>
            </div>
            <Button disabled={saving} type="submit">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

