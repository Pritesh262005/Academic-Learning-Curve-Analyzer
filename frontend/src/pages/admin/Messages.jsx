import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { listUsers } from '../../services/users';
import { sendNotification } from '../../services/notifications';

export function AdminMessagesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [targetMode, setTargetMode] = useState('role'); // role | all | user
  const [role, setRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('Announcement');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { items } = await listUsers({ limit: 300 });
        if (ignore) return;
        setUsers(items || []);
        setUserId(items?.[0]?.id || '');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (role) return users.filter((u) => u.role === role);
    return users;
  }, [users, role]);

  async function onSend(e) {
    e.preventDefault();
    setSending(true);
    try {
      const payload =
        targetMode === 'all'
          ? { targetMode: 'all', title, body, type: 'info' }
          : targetMode === 'role'
            ? { targetMode: 'role', role, title, body, type: 'info' }
            : { targetMode: 'user', userId, title, body, type: 'info' };
      await sendNotification(payload);
      toast.success('Sent');
      setBody('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admin can message all users, a role, or a single user.</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSend}>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Target</div>
                <Select value={targetMode} onChange={(e) => setTargetMode(e.target.value)}>
                  <option value="all">All users</option>
                  <option value="role">By role</option>
                  <option value="user">Single user</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Role</div>
                <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={targetMode !== 'role'}>
                  <option value="student">student</option>
                  <option value="faculty">faculty</option>
                  <option value="admin">admin</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">User</div>
                <Select value={userId} onChange={(e) => setUserId(e.target.value)} disabled={targetMode !== 'user' || loading}>
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.role} — {u.name} ({u.email})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Title</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Message</div>
                <Input value={body} onChange={(e) => setBody(e.target.value)} required placeholder="Type announcement…" />
              </div>
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

