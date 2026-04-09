import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { listStudents } from '../../services/students';
import { sendNotification } from '../../services/notifications';

export function FacultyMessagesPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('Message from Faculty');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { items } = await listStudents({ limit: 200 });
        if (ignore) return;
        setStudents(items || []);
        setStudentId(items?.[0]?.id || '');
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

  async function onSend(e) {
    e.preventDefault();
    if (!studentId) return toast.error('Select a student');
    setSending(true);
    try {
      await sendNotification({ targetMode: 'user', userId: studentId, title, body, type: 'info' });
      toast.success('Sent');
      setBody('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Message Student</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Faculty can message individual students.</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSend}>
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
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Message</div>
              <Input value={body} onChange={(e) => setBody(e.target.value)} required placeholder="Type your message…" />
            </div>
            <Button disabled={sending} type="submit">
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

