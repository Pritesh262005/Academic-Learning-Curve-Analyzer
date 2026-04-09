import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || null;

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      navigate(from || `/${user.role}`, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="self-center">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <div className="text-sm text-slate-500 dark:text-slate-400">Use your college credentials.</div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@college.edu" />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" />
          </div>
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            New student? <Link className="text-violet-700 hover:underline dark:text-violet-300" to="/register">Create an account</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

