'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';

export default function IntegrationsPage() {
  const { currentOrg } = useOrganization();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [eventType, setEventType] = useState('INVOICE_PAID');

  useEffect(() => {
    if (currentOrg) {
        fetch(`/api/webhooks?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setWebhooks);
    }
  }, [currentOrg]);

  const addWebhook = async () => {
      if (!newUrl || !currentOrg) return;
      await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              organizationId: currentOrg.id,
              url: newUrl,
              events: [eventType],
              secret: 'secret' // Optional
          })
      });
      setNewUrl('');
      // Refresh
      const res = await fetch(`/api/webhooks?organizationId=${currentOrg.id}`);
      setWebhooks(await res.json());
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Integrace a Notifikace</h1>

      <div className="grid gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🔔</span> Slack / Discord Notifikace
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Vložte Webhook URL ze Slacku nebo Discordu. Vulpi vás upozorní, když dorazí platba.
              </p>
              
              <div className="flex gap-4 mb-6">
                  <input 
                      type="text" 
                      placeholder="https://hooks.slack.com/services/..." 
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                      className="flex-1 border rounded px-4 py-2"
                  />
                  <select 
                      value={eventType}
                      onChange={e => setEventType(e.target.value)}
                      className="border rounded px-4 py-2"
                  >
                      <option value="INVOICE_PAID">Platba přijata</option>
                      <option value="INVOICE_SENT">Faktura odeslána</option>
                  </select>
                  <button 
                      onClick={addWebhook}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                      Přidat
                  </button>
              </div>

              <div className="space-y-2">
                  {webhooks.map(hook => (
                      <div key={hook.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                          <div className="truncate max-w-lg font-mono text-xs">{hook.url}</div>
                          <div className="flex gap-2 text-sm">
                              {hook.events.map((e: string) => (
                                  <span key={e} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{e}</span>
                              ))}
                          </div>
                      </div>
                  ))}
                  {webhooks.length === 0 && <div className="text-gray-500 text-sm">Žádné aktivní webhooky.</div>}
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🛒</span> E-shop Import (WooCommerce / Shoptet)
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Nastavte tento URL jako Webhook ve vašem e-shopu pro událost "Order Created".
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded font-mono text-sm break-all">
                  https://api.vulpi.cz/api/import/order?organizationId={currentOrg?.id}
              </div>
          </div>
      </div>
    </div>
  );
}
