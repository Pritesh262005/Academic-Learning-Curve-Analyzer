import { cn } from '../../lib/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-slate-800 dark:bg-slate-950',
        className
      )}
      {...props}
    />
  );
}

