import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { createUser, deleteUser, listUsers, updateUser } from '../../services/users';

export function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('Password@123');
  const [createRole, setCreateRole] = useState('student');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => items, [items]);

  const load = useCallback(async ({ q: nextQ = '', role: nextRole = '' } = {}) => {
    setLoading(true);
    try {
      const { items } = await listUsers({
        q: nextQ || undefined,
        role: nextRole || undefined,
        limit: 200,
      });
      setItems(items);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ q: '', role: '' });
  }, [load]);

  async function onCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createUser({ name: createName, email: createEmail, password: createPassword, role: createRole });
      toast.success('User created');
      setCreateName('');
      setCreateEmail('');
      await load({ q: '', role: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  async function onRoleChange(userId, nextRole) {
    try {
      await updateUser(userId, { role: nextRole });
      toast.success('Updated');
      await load({ q: '', role: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user');
    }
  }

  async function onDelete(userId) {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(userId);
      toast.success('Deleted');
      await load({ q: '', role: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <div className="text-sm text-slate-500 dark:text-slate-400">Create Admin / Faculty / Student accounts.</div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={onCreate}>
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Name" required />
            <Input value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="Email" type="email" required />
            <Input value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Password" required minLength={6} />
            <div className="flex gap-2">
              <Select value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                <option value="student">student</option>
                <option value="faculty">faculty</option>
                <option value="admin">admin</option>
              </Select>
              <Button disabled={creating} type="submit">
                {creating ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <div className="grid gap-2 pt-2 md:grid-cols-3">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email" />
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="admin">admin</option>
              <option value="faculty">faculty</option>
              <option value="student">student</option>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => load({ q, role })} disabled={loading}>
                Apply
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setQ('');
                  setRole('');
                  load({ q: '', role: '' });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge tone={u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'info' : 'neutral'}>{u.role}</Badge>
                        <Select className="h-9 w-32" value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value)}>
                          <option value="student">student</option>
                          <option value="faculty">faculty</option>
                          <option value="admin">admin</option>
                        </Select>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <Button variant="danger" size="sm" onClick={() => onDelete(u.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-500" colSpan={4}>
                      No users.
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
