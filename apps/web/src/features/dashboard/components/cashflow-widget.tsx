'use client';

import { useOrganization } from '@/components/providers/organization-provider';
import { useCashflow } from '../hooks/use-cashflow';

export default function CashflowWidget() {
  const { currentOrg } = useOrganization();
  const { data, loading } = useCashflow(currentOrg?.id);

  if (loading) return <div className="p-4 text-white">Načítání predikce...</div>;
  if (!data) return null;

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-medium opacity-90 mb-4 flex items-center gap-2">
            <span>📈</span> AI Cashflow Predikce
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
             <div className="text-sm opacity-75">Dnešní stav</div>
             <div className="text-2xl font-bold">{data.currentBalance.toFixed(0)} CZK</div>
           </div>
           <div>
             <div className="text-sm opacity-75">Predikce +30 dní</div>
             <div className={`text-2xl font-bold ${data.prediction30 < 0 ? 'text-red-200' : ''}`}>
                 {data.prediction30.toFixed(0)} CZK
             </div>
           </div>
           <div>
             <div className="text-sm opacity-75">Predikce +60 dní</div>
             <div className={`text-2xl font-bold ${data.prediction60 < 0 ? 'text-red-200' : ''}`}>
                 {data.prediction60.toFixed(0)} CZK
             </div>
           </div>
        </div>

        {data.warnings && data.warnings.length > 0 && (
            <div className="mt-4 bg-red-900/50 p-3 rounded text-sm border border-red-500/50">
                {data.warnings.map((w: string, i: number) => (
                    <div key={i}>⚠️ {w}</div>
                ))}
            </div>
        )}
    </div>
  );
}
