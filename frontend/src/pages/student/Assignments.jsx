import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { listAssignmentTasks, listAssignments, uploadAssignment } from '../../services/assignments';

function toneForStatus(status) {
  if (status === 'graded') return 'success';
  if (status === 'revision_requested') return 'warning';
  return 'info';
}

export function StudentAssignmentsPage() {
  const [tasks, setTasks] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ items: submissions }, { items: taskItems }] = await Promise.all([listAssignments(), listAssignmentTasks()]);
      setItems(submissions);
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

  async function onUpload(e) {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    setUploading(true);
    try {
      await uploadAssignment({ title, subject, description, file, taskId: taskId || null });
      toast.success('Uploaded');
      setTitle('');
      setDescription('');
      setFile(null);
      setTaskId('');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Assignments posted by faculty/admin.</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
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
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => { setTaskId(t._id); setTitle(t.title); setSubject(t.subject); }}>
                    Submit for this task
                  </Button>
                </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Upload Assignment</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Submit your work for grading.</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onUpload}>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Task (optional)</div>
              <Select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                <option value="">No task selected</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.subject} — {t.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Experiment 1 report" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Subject</div>
                <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Computer Networks</option>
                  <option>DBMS</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">File</div>
                <input
                  type="file"
                  className="block w-full text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Description</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short note (optional)" />
            </div>
            <Button disabled={uploading} type="submit">
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.title}</div>
                  <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{a.subject}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(a.createdAt).toLocaleString()}</div>
                {a.status === 'graded' && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Marks:</span> {a.marks ?? 0}
                    {a.feedback ? (
                      <span className="ml-2 text-slate-600 dark:text-slate-300">• {a.feedback}</span>
                    ) : null}
                  </div>
                )}
              </div>
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
    </div>
  );
}
