import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { createAssignmentTask, gradeAssignment, listAssignmentTasks, listAssignments } from '../../services/assignments';

function toneForStatus(status) {
  if (status === 'graded') return 'success';
  if (status === 'revision_requested') return 'warning';
  return 'info';
}

export function FacultyAssignmentsPage() {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState('0');
  const [status, setStatus] = useState('graded');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Mathematics');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ items }, { items: taskItems }] = await Promise.all([listAssignments(), listAssignmentTasks()]);
      setItems(items);
      setTasks(taskItems || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedId = selected?._id || '';
  const selectedFileUrl = useMemo(() => {
    if (!selected?.file?.path) return null;
    const normalized = selected.file.path.replaceAll('\\', '/');
    const idx = normalized.indexOf('uploads/');
    if (idx === -1) return null;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${normalized.slice(idx)}`;
  }, [selected]);

  async function onGrade(e) {
    e.preventDefault();
    if (!selectedId) return toast.error('Select an assignment');
    setSaving(true);
    try {
      await gradeAssignment(selectedId, { marks: Number(marks), status, feedback });
      toast.success('Saved');
      setSelected(null);
      setFeedback('');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to grade');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Post New Assignment</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Creates a task visible on student dashboards.</div>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setPosting(true);
              try {
                await createAssignmentTask({
                  title: taskTitle,
                  subject: taskSubject,
                  description: taskDescription,
                  dueDate: taskDueDate || undefined,
                  assignedMode: 'all_students',
                });
                toast.success('Assignment task posted');
                setTaskTitle('');
                setTaskDescription('');
                setTaskDueDate('');
                await load();
              } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to post task');
              } finally {
                setPosting(false);
              }
            }}
          >
            <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Title" required />
            <Input value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)} placeholder="Subject" required />
            <Input value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} type="date" />
            <div className="flex gap-2">
              <Input value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Short description (optional)" />
              <Button type="submit" disabled={posting}>
                {posting ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </form>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {tasks.map((t) => (
              <div key={t._id} className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t.title}</div>
                  <Badge tone="info">{t.subject}</Badge>
                </div>
                {t.dueDate ? (
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Due: {new Date(t.dueDate).toISOString().slice(0, 10)}</div>
                ) : null}
                <div className="mt-2 text-slate-600 dark:text-slate-300">{t.description || '—'}</div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No tasks posted yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((a) => (
              <button
                key={a._id}
                onClick={() => {
                  setSelected(a);
                  setMarks(String(a.marks ?? 0));
                  setStatus(a.status === 'revision_requested' ? 'revision_requested' : 'graded');
                  setFeedback(a.feedback || '');
                }}
                className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.title}</div>
                  <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{a.subject}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(a.createdAt).toLocaleString()}</div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No submissions yet.
              </div>
            )}
          </div>
          <div className="pt-3">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Select a submission to grade.</div>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No assignment selected.
            </div>
          ) : (
            <form className="space-y-3" onSubmit={onGrade}>
              <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                <div className="font-medium">{selected.title}</div>
                <div className="text-slate-600 dark:text-slate-300">{selected.subject}</div>
                {selectedFileUrl ? (
                  <a className="mt-2 inline-block text-violet-700 hover:underline dark:text-violet-300" href={selectedFileUrl} target="_blank" rel="noreferrer">
                    View uploaded file
                  </a>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Marks</div>
                  <Input value={marks} onChange={(e) => setMarks(e.target.value)} type="number" min="0" required />
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Status</div>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="graded">Graded</option>
                    <option value="revision_requested">Revision requested</option>
                  </Select>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Feedback</div>
                <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional feedback" />
              </div>
              <Button disabled={saving} type="submit">
                {saving ? 'Saving…' : 'Save grade'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
