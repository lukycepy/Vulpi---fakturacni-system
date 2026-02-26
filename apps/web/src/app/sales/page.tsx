'use client';

import Link from 'next/link';

export default function SalesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Obchod</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/sales/quotes" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-t-4 border-yellow-500">
          <h2 className="text-xl font-semibold mb-2">Nabídky (Quotes)</h2>
          <p className="text-gray-600 dark:text-gray-400">Vytvářejte cenové nabídky pro klienty</p>
        </Link>
        
        <Link href="/sales/orders" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-2">Objednávky (Orders)</h2>
          <p className="text-gray-600 dark:text-gray-400">Evidence přijatých objednávek</p>
        </Link>

        <Link href="/invoices?type=credit_note" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-t-4 border-red-500">
          <h2 className="text-xl font-semibold mb-2">Dobropisy</h2>
          <p className="text-gray-600 dark:text-gray-400">Opravné daňové doklady a storna</p>
        </Link>
      </div>

      <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded border border-dashed text-center">
          <h3 className="font-semibold mb-2">Kurzovní lístek (CNB)</h3>
          <p className="text-sm text-gray-500">Automaticky stahujeme kurzy každý den ve 14:35.</p>
          <div className="mt-4 flex justify-center gap-6">
              <div className="text-center">
                  <div className="text-2xl font-bold">25.12 CZK</div>
                  <div className="text-xs uppercase">1 EUR</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold">23.45 CZK</div>
                  <div className="text-xs uppercase">1 USD</div>
              </div>
          </div>
      </div>
    </div>
  );
}
