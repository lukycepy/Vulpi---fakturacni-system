'use client';

import { useState } from 'react';
import { useOrganization } from '../../components/providers/organization-provider';

export default function SettingsPage() {
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reminders' | 'recurring'>('reminders');

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nastavení organizace</h1>
      
      <div className="flex border-b mb-6">
        <button 
            className={`px-4 py-2 ${activeTab === 'reminders' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reminders')}
        >
            Upomínky
        </button>
        <button 
            className={`px-4 py-2 ${activeTab === 'recurring' ? 'border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('recurring')}
        >
            Pravidelné faktury
        </button>
      </div>

      {activeTab === 'reminders' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Automatické upomínky</h2>
              <p className="text-gray-500 mb-4">Nastavte, kdy a jak se mají odesílat upomínky klientům.</p>
              
              <div className="space-y-4">
                  <div className="flex items-center gap-2">
                      <input type="checkbox" id="enableReminders" className="w-4 h-4" />
                      <label htmlFor="enableReminders">Povolit automatické upomínky</label>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                      <div>
                          <label className="block text-sm font-medium mb-1">1. upomínka (dní po splatnosti)</label>
                          <input type="number" defaultValue={3} className="border rounded px-3 py-2 w-full" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Text upomínky</label>
                          <textarea className="border rounded px-3 py-2 w-full text-sm" rows={2} defaultValue="Upozornění: Faktura je po splatnosti." />
                      </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                      <div>
                          <label className="block text-sm font-medium mb-1">2. upomínka (dní po splatnosti)</label>
                          <input type="number" defaultValue={7} className="border rounded px-3 py-2 w-full" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1">Text upomínky</label>
                          <textarea className="border rounded px-3 py-2 w-full text-sm" rows={2} defaultValue="Důrazné upozornění: Faktura je stále neuhrazena." />
                      </div>
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Uložit nastavení</button>
              </div>
          </div>
      )}

      {activeTab === 'recurring' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Šablony pravidelných faktur</h2>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ Nová šablona</button>
              </div>
              
              <div className="text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-900 rounded border border-dashed">
                  Zatím nemáte žádné šablony.
              </div>
          </div>
      )}
    </div>
  );
}
