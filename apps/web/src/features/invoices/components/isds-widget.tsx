'use client';

import { useState } from 'react';

export default function IsdsWidget({ invoice }: { invoice: any }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dataBoxId, setDataBoxId] = useState<string | null>(invoice.client?.dataBoxId || null);

  const checkIsds = async () => {
      if (!invoice.client?.ico) return;
      setChecking(true);
      try {
          const res = await fetch('/api/isds/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ico: invoice.client.ico })
          });
          const data = await res.json();
          if (data.dataBoxId) {
              setDataBoxId(data.dataBoxId);
          } else {
              alert('Datová schránka nenalezena');
          }
      } finally {
          setChecking(false);
      }
  };

  const sendInvoice = async () => {
      if (!dataBoxId) return;
      if (!confirm(`Odeslat fakturu do Datové schránky ${dataBoxId}?`)) return;

      setLoading(true);
      try {
          const res = await fetch('/api/isds/send-invoice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invoiceId: invoice.id, dataBoxId })
          });
          if (res.ok) {
              alert('Odesláno do Datové schránky');
          } else {
              alert('Chyba při odesílání');
          }
      } finally {
          setLoading(false);
      }
  };

  return (
      <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Datová schránka</span>
              {dataBoxId && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">{dataBoxId}</span>}
          </div>
          
          {!dataBoxId ? (
              <button 
                  onClick={checkIsds}
                  disabled={checking || !invoice.client?.ico}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                  {checking ? 'Ověřuji...' : 'Ověřit existenci schránky (ISDS)'}
              </button>
          ) : (
              <button 
                  onClick={sendInvoice}
                  disabled={loading}
                  className="w-full text-center text-sm border border-blue-600 text-blue-600 rounded px-2 py-1 hover:bg-blue-50"
              >
                  {loading ? 'Odesílám...' : 'Odeslat do schránky'}
              </button>
          )}
      </div>
  );
}
