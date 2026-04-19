import { GraduationCap } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Pane - Branding & Graphic */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-slate-950 lg:flex">
        {/* Background gradient effects */}
        <div className="absolute left-0 top-0 z-0 h-full w-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20" />
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 animate-blob rounded-full bg-violet-600 opacity-50 mix-blend-multiply blur-3xl filter" />
        <div 
          className="absolute right-[-10%] top-[20%] h-96 w-96 animate-blob rounded-full bg-fuchsia-600 opacity-50 mix-blend-multiply blur-3xl filter" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute bottom-[-20%] left-[20%] h-96 w-96 animate-blob rounded-full bg-cyan-600 opacity-50 mix-blend-multiply blur-3xl filter" 
          style={{ animationDelay: '4s' }} 
        />
        
        <div className="relative z-10 flex flex-col items-center px-12 text-center text-white">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg">
            <GraduationCap className="h-10 w-10 text-violet-300" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Academic Learning Curve Analyzer
          </h1>
          <p className="max-w-md text-lg font-light leading-relaxed text-slate-300">
            Elevate your academic journey. Track performance, attendance, and unlock your true potential with intelligent analytics.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-8 transition-colors duration-300 dark:bg-slate-900 sm:p-12 lg:w-1/2 lg:p-24">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
