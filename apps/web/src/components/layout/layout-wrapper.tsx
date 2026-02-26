'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';
import { OrganizationSwitcher } from '../organization-switcher';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on auth pages even if user is technically loaded (e.g. just logged out or redirecting)
  const isAuthPage = pathname?.startsWith('/auth/');
  const isPortalPage = pathname?.startsWith('/portal/');
  
  const showSidebar = user && !isAuthPage && !isPortalPage;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Načítání aplikace...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showSidebar && <Sidebar />}
      
      <div className={`min-h-screen flex flex-col transition-all duration-200 ${showSidebar ? 'ml-64' : ''}`}>
        {/* Header - Only show if sidebar is shown (logged in) */}
        {showSidebar && (
            <header className="h-16 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
                <div className="font-bold text-xl">Vulpi</div>
                <OrganizationSwitcher />
            </header>
        )}
        
        {/* If not logged in (e.g. login page), render simple container */}
        {!showSidebar && (
            <main className="flex-1">
                {children}
            </main>
        )}

        {/* If logged in, main content area */}
        {showSidebar && (
            <main className="flex-1 p-6">
                {children}
            </main>
        )}
      </div>
    </div>
  );
}
