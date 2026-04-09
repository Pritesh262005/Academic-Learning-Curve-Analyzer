import { cn } from '../../lib/cn';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    outline:
      'border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900',
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

