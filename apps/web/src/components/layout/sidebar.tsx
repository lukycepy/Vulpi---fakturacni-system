'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { useOrganization } from '../providers/organization-provider';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currentOrg } = useOrganization();

  if (!user) return null; // Or render nothing if not logged in

  const isActive = (path: string) => pathname?.startsWith(path);

  const isAdmin = user.role === 'ADMIN';
  const isWorker = user.role === 'WORKER';
  // Client portal usually has its own layout, but if they land here:
  const isClient = user.role === 'CLIENT';

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-blue-400">Vulpi</span>
        <span className="text-xs text-gray-500 uppercase">{user.role}</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {/* Dashboard - Visible to all except maybe client */}
          {!isClient && (
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/dashboard') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              📊 Dashboard
            </Link>
          )}

          {/* Admin Only Sections */}
          {isAdmin && (
            <>
              <div className="mt-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Finance
              </div>
              <Link
                href="/invoices"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/invoices') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                📄 Faktury
              </Link>
              <Link
                href="/expenses"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/expenses') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                💸 Náklady
              </Link>
              <Link
                href="/finance/cash"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/finance/cash') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                💰 Pokladna
              </Link>
              <Link
                href="/reports"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/reports') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                📈 Reporty
              </Link>
            </>
          )}

          {/* Worker & Admin Sections */}
          {(isAdmin || isWorker) && (
            <>
              <div className="mt-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Provoz
              </div>
              <Link
                href="/time-tracking"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/time-tracking') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                ⏱️ Výkazy práce
              </Link>
              <Link
                href="/inventory"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/inventory') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                📦 Sklad
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/crm"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/crm') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    🤝 CRM
                  </Link>
                  <Link
                    href="/hr"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive('/hr') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    👥 HR & Mzdy
                  </Link>
                </>
              )}
            </>
          )}

          {/* Settings - Admin Only */}
          {isAdmin && (
            <>
              <div className="mt-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Systém
              </div>
              <Link
                href="/settings"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/settings') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                ⚙️ Nastavení
              </Link>
              <Link
                href="/admin/system-health"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/system-health') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                ❤️ System Health
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white truncate w-32">{user.name || 'Uživatel'}</p>
            <p className="text-xs text-gray-400 truncate w-32">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
        >
          🚪 Odhlásit se
        </button>
      </div>
    </aside>
  );
}
