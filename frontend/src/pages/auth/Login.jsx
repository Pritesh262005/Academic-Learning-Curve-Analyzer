import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
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
    } catch (err) {
      console.error('Login failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your college credentials to access your dashboard
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
            Email
          </label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            required 
            placeholder="you@college.edu" 
            className="h-12 border-slate-200 bg-white transition-all focus:ring-2 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-950/50"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link to="#" className="text-sm font-medium text-violet-600 hover:text-violet-500 hover:underline dark:text-violet-400 dark:hover:text-violet-300">
              Forgot password?
            </Link>
          </div>
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            required 
            placeholder="••••••••" 
            className="h-12 border-slate-200 bg-white transition-all focus:ring-2 focus:ring-violet-500 dark:border-slate-800 dark:bg-slate-950/50"
          />
        </div>
        <div className="pt-2">
          <Button className="h-12 w-full text-base font-medium shadow-md transition-all hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0" disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        New student?{' '}
        <Link className="font-semibold text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300" to="/register">
          Create an account
        </Link>
      </div>
    </div>
  );
}

