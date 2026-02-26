'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SuperAdmin Dashboard</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Vítejte v administrátorské zóně. Zde můžete spravovat systémové nastavení a monitorovat stav aplikace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/admin/system-health" 
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-green-500"
        >
          <h2 className="text-xl font-semibold mb-2">System Health</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitorování stavu služeb, Cron jobů a systémových metrik.
          </p>
        </Link>

        <div className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow opacity-50 border-l-4 border-gray-300">
          <h2 className="text-xl font-semibold mb-2">Správa uživatelů</h2>
          <p className="text-gray-600 dark:text-gray-400">
            (Coming Soon) Přehled všech uživatelů a jejich rolí.
          </p>
        </div>

        <div className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow opacity-50 border-l-4 border-gray-300">
          <h2 className="text-xl font-semibold mb-2">Správa organizací</h2>
          <p className="text-gray-600 dark:text-gray-400">
            (Coming Soon) Přehled všech organizací v systému.
          </p>
        </div>
      </div>
    </div>
  );
}
