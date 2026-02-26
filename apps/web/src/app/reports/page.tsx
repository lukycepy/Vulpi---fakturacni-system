'use client';

import { useOrganization } from '@/components/providers/organization-provider';

import Link from 'next/link';

export default function ReportsPage() {
  const { currentOrg } = useOrganization();
  const year = new Date().getFullYear();

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reporty a Exporty</h1>

      <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Finanční BI (Business Intelligence)</h2>
          <p className="mb-4 text-purple-100">Pokročilé analýzy LTV, Churn Rate a predikce DPH.</p>
          <Link href="/reports/bi" className="inline-block bg-white text-purple-600 px-6 py-2 rounded font-bold hover:bg-gray-100 transition">
              Otevřít BI Dashboard
          </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Exporty pro účetní</h2>
          <p className="text-gray-500 mb-6">Stáhněte si podklady pro import do účetního softwaru.</p>
          
          <div className="space-y-3">
            <a 
              href={`/api/export/pohoda?organizationId=${currentOrg.id}&year=${year}`}
              target="_blank"
              className="block w-full text-center bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Stáhnout XML (Pohoda)
            </a>
            <a 
              href={`/api/export/csv?organizationId=${currentOrg.id}&year=${year}`}
              target="_blank"
              className="block w-full text-center border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Stáhnout CSV (Excel)
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
           <h2 className="text-xl font-semibold mb-4">Daňový přehled {year}</h2>
           {/* Here we would fetch data from /api/reports/tax and display charts */}
           <div className="space-y-4">
             <div className="flex justify-between border-b pb-2">
               <span>Příjmy celkem</span>
               <span className="font-bold">1 250 000 CZK</span>
             </div>
             <div className="flex justify-between border-b pb-2">
               <span>Výdaje celkem</span>
               <span className="font-bold">450 000 CZK</span>
             </div>
             <div className="flex justify-between border-b pb-2 pt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
               <span>Zisk před zdaněním</span>
               <span className="font-bold text-green-600">800 000 CZK</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
