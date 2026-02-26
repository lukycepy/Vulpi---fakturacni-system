'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function MarketingPage() {
  const { currentOrg } = useOrganization();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', type: 'PERCENTAGE', value: 0, usageLimit: 100 });

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/marketing/discounts?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setDiscounts);
    }
  }, [currentOrg]);

  const createCode = async () => {
      await fetch('/api/marketing/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newCode, organizationId: currentOrg?.id })
      });
      setShowForm(false);
      // Refresh
      const res = await fetch(`/api/marketing/discounts?organizationId=${currentOrg?.id}`);
      setDiscounts(await res.json());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketing & Slevy</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
              + Nový slevový kód
          </button>
      </div>

      {showForm && (
          <div className="bg-white p-6 rounded shadow mb-8">
              <h3 className="font-bold mb-4">Vytvořit kód</h3>
              <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Kód (např. VANOCE2024)" className="border p-2 rounded uppercase" onChange={e => setNewCode({...newCode, code: e.target.value.toUpperCase()})} />
                  <div className="flex gap-2">
                      <select className="border p-2 rounded" onChange={e => setNewCode({...newCode, type: e.target.value})}>
                          <option value="PERCENTAGE">Procento (%)</option>
                          <option value="FIXED">Částka (CZK)</option>
                      </select>
                      <input type="number" placeholder="Hodnota" className="border p-2 rounded flex-1" onChange={e => setNewCode({...newCode, value: Number(e.target.value)})} />
                  </div>
              </div>
              <button onClick={createCode} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Uložit</button>
          </div>
      )}

      <div className="grid gap-6">
          {discounts.map(d => (
              <div key={d.id} className="bg-white dark:bg-gray-800 p-6 rounded shadow flex justify-between items-center">
                  <div>
                      <h3 className="text-xl font-bold font-mono text-blue-600">{d.code}</h3>
                      <div className="text-gray-500">
                          {d.type === 'PERCENTAGE' ? `${d.value}% sleva` : `${d.value} CZK sleva`}
                      </div>
                  </div>
                  
                  <div className="text-right">
                      <div className="text-sm text-gray-500">Použito</div>
                      <div className="font-bold text-lg">{d.usageCount} / {d.usageLimit || '∞'}</div>
                  </div>

                  <div className="text-right border-l pl-6">
                      <div className="text-sm text-gray-500">ROI (Návratnost)</div>
                      <div className={`font-bold text-xl ${Number(d.totalRevenueGenerated) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {Number(d.totalDiscountGiven) > 0 
                              ? ((Number(d.totalRevenueGenerated) / Number(d.totalDiscountGiven)) * 100).toFixed(0) + '%' 
                              : '0%'}
                      </div>
                      <div className="text-xs text-gray-400">
                          Sleva: {Number(d.totalDiscountGiven).toFixed(0)} | Tržba: {Number(d.totalRevenueGenerated).toFixed(0)}
                      </div>
                  </div>
              </div>
          ))}
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded border">
          <h2 className="text-xl font-bold mb-4">📢 Automatické oslovení (Retention)</h2>
          <p className="text-gray-600">
              Systém automaticky kontroluje klienty, kteří u vás nenakoupili déle než 3 měsíce.
              Pokud mají souhlas s marketingem, odešle jim e-mail s nabídkou.
          </p>
          <div className="mt-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-green-700">Aktivní (Denně v 10:00)</span>
          </div>
      </div>
    </div>
  );
}
