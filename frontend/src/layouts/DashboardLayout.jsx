import { Dialog } from '@headlessui/react';
import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout({ role }) {
  const { user } = useAuth();
  const effectiveRole = useMemo(() => role || user?.role, [role, user?.role]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full">
      <div className="hidden sm:block">
        <Sidebar role={effectiveRole} />
      </div>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 sm:hidden">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex">
          <Dialog.Panel className="h-full">
            <Sidebar role={effectiveRole} onNavigate={() => setMobileOpen(false)} />
          </Dialog.Panel>
        </div>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={effectiveRole} onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

