import { GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950/20">
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center px-4 py-12">
        <div className="grid w-full gap-8 md:grid-cols-2">
          <div className="hidden md:flex md:flex-col md:justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold">Academic Learning Curve Analyzer</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Track performance, attendance, and growth.
                </div>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
