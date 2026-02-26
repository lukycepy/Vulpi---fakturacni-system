'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function DeveloperSettingsPage() {
  const { currentOrg } = useOrganization();
  const [keys, setKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrg) {
        loadKeys();
        loadWebhooks();
    }
  }, [currentOrg]);

  const loadKeys = async () => {
    const res = await fetch(`/api/api-keys?organizationId=${currentOrg?.id}`);
    if (res.ok) setKeys(await res.json());
  };

  const loadWebhooks = async () => {
    const res = await fetch(`/api/webhooks?organizationId=${currentOrg?.id}`);
    if (res.ok) setWebhooks(await res.json());
  };

  const createKey = async () => {
    const name = prompt('Název klíče (např. E-shop):');
    if (!name) return;

    setLoading(true);
    try {
        const res = await fetch('/api/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId: currentOrg?.id, name })
        });
        const data = await res.json();
        setNewKey(data.rawKey);
        loadKeys();
    } finally {
        setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
      if(!confirm('Opravdu smazat klíč?')) return;
      await fetch(`/api/api-keys/${id}?organizationId=${currentOrg?.id}`, { method: 'DELETE' });
      loadKeys();
  };

  const createWebhook = async () => {
      const url = prompt('Webhook URL:');
      if (!url) return;
      
      await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              organizationId: currentOrg?.id, 
              url,
              events: ['invoice.paid', 'invoice.sent'] // Default events
          })
      });
      loadWebhooks();
  };

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Vývojářské nastavení</h1>

      {/* API Keys Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Klíče</h2>
            <button 
                onClick={createKey} 
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                + Generovat klíč
            </button>
        </div>

        {newKey && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Váš nový API klíč: </strong>
                <span className="font-mono bg-white px-2 py-1 rounded select-all">{newKey}</span>
                <p className="text-sm mt-1">Uložte si ho bezpečně. Znovu se již nezobrazí!</p>
                <button onClick={() => setNewKey(null)} className="text-xs underline mt-2">Zavřít</button>
            </div>
        )}

        <table className="w-full text-left">
            <thead>
                <tr className="border-b dark:border-gray-700">
                    <th className="py-2">Název</th>
                    <th className="py-2">Prefix</th>
                    <th className="py-2">Vytvořeno</th>
                    <th className="py-2">Naposledy použito</th>
                    <th className="py-2">Akce</th>
                </tr>
            </thead>
            <tbody>
                {keys.map(key => (
                    <tr key={key.id} className="border-b dark:border-gray-700">
                        <td className="py-2">{key.name}</td>
                        <td className="py-2 font-mono text-sm">{key.keyPrefix}...</td>
                        <td className="py-2 text-sm text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 text-sm text-gray-500">
                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2">
                            <button onClick={() => deleteKey(key.id)} className="text-red-500 hover:text-red-700 text-sm">Smazat</button>
                        </td>
                    </tr>
                ))}
                {keys.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-gray-500">Žádné API klíče</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Webhooky</h2>
            <button onClick={createWebhook} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                + Přidat Endpoint
            </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
            Nastavte URL adresy, kam budeme posílat notifikace o událostech (např. invoice.paid).
        </p>

        <ul className="space-y-2">
            {webhooks.map(wh => (
                <li key={wh.id} className="border p-3 rounded flex justify-between items-center">
                    <div>
                        <div className="font-mono text-sm">{wh.url}</div>
                        <div className="text-xs text-gray-500 mt-1">Events: {wh.events.join(', ')}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${wh.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        {wh.isActive ? 'Aktivní' : 'Neaktivní'}
                    </span>
                </li>
            ))}
             {webhooks.length === 0 && (
                <li className="text-center text-gray-500 py-4">Žádné webhooky nastaveny</li>
            )}
        </ul>
      </div>
    </div>
  );
}
