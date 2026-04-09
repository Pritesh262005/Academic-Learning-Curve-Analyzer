import { cn } from '../../lib/cn';

export function Badge({ className, tone = 'neutral', ...props }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    info: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)} {...props} />
  );
}

