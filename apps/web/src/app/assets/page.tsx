'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function AssetsPage() {
  const { currentOrg } = useOrganization();
  const [assets, setAssets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
      name: '',
      inventoryNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionPrice: 0,
      depreciationGroup: 1,
      depreciationMethod: 'STRAIGHT'
  });

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/assets?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setAssets);
    }
  }, [currentOrg]);

  const submitAsset = async () => {
      await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newAsset, organizationId: currentOrg?.id })
      });
      setShowForm(false);
      const res = await fetch(`/api/assets?organizationId=${currentOrg?.id}`);
      setAssets(await res.json());
  };

  const postDepreciation = async (depId: string) => {
      if (!confirm('Opravdu zaúčtovat tento odpis do nákladů?')) return;
      await fetch(`/api/assets/depreciations/${depId}/post`, { method: 'POST' });
      // Refresh
      const res = await fetch(`/api/assets?organizationId=${currentOrg?.id}`);
      setAssets(await res.json());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dlouhodobý majetek</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
              + Nový majetek
          </button>
      </div>

      {showForm && (
          <div className="bg-white p-6 rounded shadow mb-8">
              <h3 className="font-bold mb-4">Zadat majetek</h3>
              <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Název (např. Auto)" className="border p-2 rounded" onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                  <input placeholder="Inventární číslo" className="border p-2 rounded" onChange={e => setNewAsset({...newAsset, inventoryNumber: e.target.value})} />
                  <input type="date" className="border p-2 rounded" onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})} />
                  <input type="number" placeholder="Cena (CZK)" className="border p-2 rounded" onChange={e => setNewAsset({...newAsset, acquisitionPrice: Number(e.target.value)})} />
                  <select className="border p-2 rounded" onChange={e => setNewAsset({...newAsset, depreciationGroup: Number(e.target.value)})}>
                      <option value="1">Skupina 1 (3 roky) - PC, Nástroje</option>
                      <option value="2">Skupina 2 (5 let) - Auta, Nábytek</option>
                      <option value="3">Skupina 3 (10 let) - Klimatizace</option>
                      {/* ... */}
                  </select>
              </div>
              <button onClick={submitAsset} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Uložit</button>
          </div>
      )}

      <div className="space-y-6">
          {assets.map(asset => (
              <div key={asset.id} className="bg-white dark:bg-gray-800 rounded shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                              {asset.name}
                              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 rounded">
                                  {asset.inventoryNumber}
                              </span>
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                              Pořízeno: {new Date(asset.acquisitionDate).toLocaleDateString()} | 
                              Cena: {Number(asset.acquisitionPrice).toFixed(0)} CZK |
                              Zůstatková hodnota: {Number(asset.residualValue).toFixed(0)} CZK
                          </div>
                      </div>
                      <div className="text-right">
                          <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ASSET:${asset.id}`} 
                              alt="QR" 
                              className="w-16 h-16 border"
                          />
                      </div>
                  </div>

                  {/* Depreciation Schedule */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                  <th className="p-2">Rok</th>
                                  <th className="p-2">Částka odpisu</th>
                                  <th className="p-2">Stav</th>
                                  <th className="p-2">Akce</th>
                              </tr>
                          </thead>
                          <tbody>
                              {asset.depreciations.map((dep: any) => (
                                  <tr key={dep.id} className="border-b last:border-0">
                                      <td className="p-2 font-bold">{dep.year}</td>
                                      <td className="p-2">{Number(dep.amount).toFixed(0)} CZK</td>
                                      <td className="p-2">
                                          {dep.isPosted ? (
                                              <span className="text-green-600 font-bold">ZAÚČTOVÁNO</span>
                                          ) : (
                                              <span className="text-gray-400">Plánováno</span>
                                          )}
                                      </td>
                                      <td className="p-2">
                                          {!dep.isPosted && new Date().getFullYear() >= dep.year && (
                                              <button 
                                                  onClick={() => postDepreciation(dep.id)}
                                                  className="text-blue-600 hover:underline"
                                              >
                                                  Zaúčtovat
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          ))}
          {assets.length === 0 && <div className="text-gray-500 text-center p-8">Žádný majetek v evidenci.</div>}
      </div>
    </div>
  );
}
