'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function PricingPage() {
  const { currentOrg } = useOrganization();
  const [lists, setLists] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/pricing/lists?organizationId=${currentOrg.id}`).then(res => res.json()).then(setLists);
        fetch(`/api/inventory/products?organizationId=${currentOrg.id}`).then(res => res.json()).then(setProducts);
    }
  }, [currentOrg]);

  const createList = async () => {
      const name = prompt('Název ceníku (např. Velkoobchod):');
      if (!name) return;
      await fetch('/api/pricing/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: currentOrg?.id, name })
      });
      // Refresh
      const res = await fetch(`/api/pricing/lists?organizationId=${currentOrg?.id}`);
      setLists(await res.json());
  };

  const updatePrice = async (priceListId: string, productId: string, price: number) => {
      await fetch(`/api/pricing/lists/${priceListId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, price })
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Ceníky (B2B)</h1>
          <button onClick={createList} className="bg-blue-600 text-white px-4 py-2 rounded">+ Nový ceník</button>
      </div>

      <div className="flex gap-6">
          {/* Sidebar Lists */}
          <div className="w-1/4 bg-white dark:bg-gray-800 rounded shadow p-4">
              <h3 className="font-bold mb-4 text-gray-500 uppercase text-xs">Vaše ceníky</h3>
              <ul className="space-y-2">
                  {lists.map(list => (
                      <li 
                          key={list.id} 
                          className={`p-2 rounded cursor-pointer ${selectedList === list.id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedList(list.id)}
                      >
                          {list.name}
                      </li>
                  ))}
              </ul>
          </div>

          {/* Product Grid */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded shadow p-6">
              {!selectedList ? (
                  <div className="text-gray-500 text-center py-20">Vyberte ceník pro editaci cen.</div>
              ) : (
                  <div>
                      <h2 className="text-xl font-bold mb-4">Nastavení cen pro: {lists.find(l => l.id === selectedList)?.name}</h2>
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                  <th className="p-3">Produkt</th>
                                  <th className="p-3">Základní cena</th>
                                  <th className="p-3">Cena v ceníku</th>
                              </tr>
                          </thead>
                          <tbody>
                              {products.map(p => (
                                  <tr key={p.id} className="border-b">
                                      <td className="p-3">{p.name}</td>
                                      <td className="p-3 text-gray-500">{Number(p.unitPrice).toFixed(2)}</td>
                                      <td className="p-3">
                                          <input 
                                              type="number" 
                                              placeholder="Zadejte cenu"
                                              className="border p-2 rounded w-32"
                                              onBlur={(e) => updatePrice(selectedList, p.id, Number(e.target.value))}
                                          />
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
