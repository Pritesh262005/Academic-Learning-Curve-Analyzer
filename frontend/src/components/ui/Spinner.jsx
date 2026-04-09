import { cn } from '../../lib/cn';

export function Spinner({ className }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400',
        className
      )}
    />
  );
}

