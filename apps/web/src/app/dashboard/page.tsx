import Link from 'next/link';
import CashflowWidget from '@/features/dashboard/components/cashflow-widget';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* AI Cashflow Widget */}
      <CashflowWidget />
      
      {/* Financial Overview Widget */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-medium opacity-90 mb-4">Finanční přehled (Tento rok)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
             <div className="text-sm opacity-75">Příjmy</div>
             <div className="text-2xl font-bold">+ 1 250 000 CZK</div>
           </div>
           <div>
             <div className="text-sm opacity-75">Výdaje</div>
             <div className="text-2xl font-bold">- 450 000 CZK</div>
           </div>
           <div>
             <div className="text-sm opacity-75">Odhad daně (19%)</div>
             <div className="text-2xl font-bold">152 000 CZK</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/organizations/new" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Organizace</h2>
          <p className="text-gray-600 dark:text-gray-400">Správa vašich firem a nastavení</p>
        </Link>
        
        <Link href="/invoices/new" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Nová faktura</h2>
          <p className="text-gray-600 dark:text-gray-400">Vytvořit novou fakturu</p>
        </Link>
        
        <Link href="/sales" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-yellow-500">
          <h2 className="text-xl font-semibold mb-2">Obchod</h2>
          <p className="text-gray-600 dark:text-gray-400">Nabídky, Objednávky, Dobropisy</p>
        </Link>

        <Link href="/expenses/new" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Nový výdaj</h2>
          <p className="text-gray-600 dark:text-gray-400">Zaevidovat přijatou fakturu</p>
        </Link>

        <Link href="/reports" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Reporty a Exporty</h2>
          <p className="text-gray-600 dark:text-gray-400">Daňové podklady, CSV, Pohoda</p>
        </Link>

        <Link href="/inventory" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-2">Sklad a Produkty</h2>
          <p className="text-gray-600 dark:text-gray-400">Evidence skladu, čárové kódy</p>
        </Link>
        
        <Link href="/settings" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">Nastavení</h2>
          <p className="text-gray-600 dark:text-gray-400">Upomínky a pravidelné faktury</p>
        </Link>

        <Link href="/settings/developer" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Pro vývojáře</h2>
          <p className="text-gray-600 dark:text-gray-400">API klíče, Webhooky</p>
        </Link>

        <Link href="/settings/audit" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-gray-500">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Audit a Bezpečnost</h2>
          <p className="text-gray-600 dark:text-gray-400">Historie akcí, GDPR nástroje</p>
        </Link>

        <Link href="/time-tracking" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-2 text-orange-600 dark:text-orange-400">Měření času</h2>
          <p className="text-gray-600 dark:text-gray-400">Stopky a výkazy práce</p>
        </Link>

        <Link href="/settings/integrations" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-400">
          <h2 className="text-xl font-semibold mb-2 text-blue-500 dark:text-blue-300">Integrace</h2>
          <p className="text-gray-600 dark:text-gray-400">Slack, E-shopy, Webhooky</p>
        </Link>

        <Link href="/admin/system-health" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-red-500">
          <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">System Health</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitoring cronů a stavu systému</p>
        </Link>

        <Link href="/hr" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-pink-500">
          <h2 className="text-xl font-semibold mb-2 text-pink-600 dark:text-pink-400">HR & Mzdy</h2>
          <p className="text-gray-600 dark:text-gray-400">Zaměstnanci, Odměny, Náhrady</p>
        </Link>

        <Link href="/finance/cash" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-emerald-500">
          <h2 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">Pokladna</h2>
          <p className="text-gray-600 dark:text-gray-400">Hotovostní deník, příjmy a výdaje</p>
        </Link>

        <Link href="/hr/travel" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-cyan-500">
          <h2 className="text-xl font-semibold mb-2 text-cyan-600 dark:text-cyan-400">Cestovní příkazy</h2>
          <p className="text-gray-600 dark:text-gray-400">Cesťáky, diety, auto</p>
        </Link>

        <Link href="/crm" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-yellow-400">
          <h2 className="text-xl font-semibold mb-2 text-yellow-500 dark:text-yellow-300">CRM</h2>
          <p className="text-gray-600 dark:text-gray-400">Obchodní příležitosti, Pipeline</p>
        </Link>

        <Link href="/assets" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-indigo-500">
          <h2 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Majetek</h2>
          <p className="text-gray-600 dark:text-gray-400">Evidence a odpisy majetku</p>
        </Link>

        <Link href="/inventory" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-teal-500">
          <h2 className="text-xl font-semibold mb-2 text-teal-600 dark:text-teal-400">Skladová inventura</h2>
          <p className="text-gray-600 dark:text-gray-400">Sklady, převodky, inventury</p>
        </Link>

        <Link href="/settings/security" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-slate-700">
          <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-400">Bezpečnostní Trezor</h2>
          <p className="text-gray-600 dark:text-gray-400">IP Zámek, Šifrování</p>
        </Link>

        <Link href="/contracts" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-rose-500">
          <h2 className="text-xl font-semibold mb-2 text-rose-600 dark:text-rose-400">Smlouvy</h2>
          <p className="text-gray-600 dark:text-gray-400">Generátor, Elektronický podpis</p>
        </Link>

        <Link href="/pos" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-green-600">
          <h2 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-500">POS Terminál</h2>
          <p className="text-gray-600 dark:text-gray-400">Maloobchodní prodej, Účtenky</p>
        </Link>

        <Link href="/marketing" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-fuchsia-500">
          <h2 className="text-xl font-semibold mb-2 text-fuchsia-600 dark:text-fuchsia-400">Marketing</h2>
          <p className="text-gray-600 dark:text-gray-400">Slevové kódy, Retence, ROI</p>
        </Link>

        <Link href="/help" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-sky-500">
          <h2 className="text-xl font-semibold mb-2 text-sky-600 dark:text-sky-400">Nápověda</h2>
          <p className="text-gray-600 dark:text-gray-400">Dokumentace, Průvodce</p>
        </Link>

        <Link href="/pricing" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-amber-600">
          <h2 className="text-xl font-semibold mb-2 text-amber-600 dark:text-amber-500">B2B Ceníky</h2>
          <p className="text-gray-600 dark:text-gray-400">Velkoobchodní ceny</p>
        </Link>

        <Link href="/edi" className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition border-l-4 border-lime-600">
          <h2 className="text-xl font-semibold mb-2 text-lime-600 dark:text-lime-500">EDI Komunikace</h2>
          <p className="text-gray-600 dark:text-gray-400">EDIFACT zprávy, Řetězce</p>
        </Link>
      </div>

      {/* Bank Movements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Poslední bankovní pohyby</h2>
        {/* Mock Data */}
        <div className="space-y-4">
            <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="font-medium text-green-600">+ 12 500 CZK</div>
                        <div className="text-sm text-gray-500">VS: 20240001 (Spárováno s fakturou)</div>
                    </div>
                    <div className="text-sm text-gray-500">Dnes, 10:30</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
