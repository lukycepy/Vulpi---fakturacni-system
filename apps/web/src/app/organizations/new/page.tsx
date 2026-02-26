'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { refreshOrganizations } = useOrganization();
  const { fetchWithAuth, user } = useAuth();
  
  const [ico, setIco] = useState('');
  const [aresData, setAresData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFromAres = async () => {
    if (!ico) return;
    setLoading(true);
    setError('');
    setAresData(null);

    try {
      const res = await fetchWithAuth(`/api/organizations/ares/${ico}`);
      if (!res.ok) {
        let errorMessage = 'Chyba při načítání z ARES';
        try {
          const err = await res.json();
          errorMessage = err.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = res.statusText || `Chyba serveru (${res.status})`;
        }
        throw new Error(errorMessage);
      }
      const data = await res.json().catch(() => {
        throw new Error('Neplatná odpověď serveru (JSON)');
      });
      setAresData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!aresData) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetchWithAuth('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ico: aresData.ico,
          name: aresData.name,
          dic: aresData.dic,
          address: aresData.address,
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Chyba při vytváření organizace');
      }

      await refreshOrganizations();
      router.push('/dashboard'); // Or wherever needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nová organizace</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">IČO</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ico}
              onChange={(e) => setIco(e.target.value)}
              className="flex-1 border rounded px-3 py-2 bg-transparent"
              placeholder="Zadejte IČO (např. 27074358)"
            />
            <button
              onClick={loadFromAres}
              disabled={loading || !ico}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Načítám...' : 'Načíst z ARES'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {aresData && (
          <div className="border-t pt-4 mt-4 space-y-4">
            <h3 className="font-semibold text-lg">Nalezená data</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 block">Název</span>
                <span className="font-medium">{aresData.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">IČO</span>
                <span className="font-medium">{aresData.ico}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">DIČ</span>
                <span className="font-medium">{aresData.dic || '-'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Adresa</span>
                <span className="font-medium">{aresData.address}</span>
              </div>
            </div>

            <button
              onClick={createOrganization}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 font-medium mt-4 disabled:opacity-50"
            >
              {loading ? 'Vytvářím...' : 'Vytvořit organizaci'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
