import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subjects, setSubjects] = useState('Mathematics, Physics, Chemistry');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="self-center">
      <CardHeader>
        <CardTitle>Create student account</CardTitle>
        <div className="text-sm text-slate-500 dark:text-slate-400">Admins create faculty/admin from Admin dashboard.</div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Full name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@college.edu" />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Subjects (comma separated)</div>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. DBMS, OS, CN" />
          </div>
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? 'Creating…' : 'Create account'}
          </Button>
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account? <Link className="text-violet-700 hover:underline dark:text-violet-300" to="/login">Login</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

