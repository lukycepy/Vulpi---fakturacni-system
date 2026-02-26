'use client';

import { useState } from 'react';

export default function ShippingWidget({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(order.trackingNumber);
  const [labelUrl, setLabelUrl] = useState(order.shippingLabelUrl);

  const createLabel = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/shipping/create-label', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id })
        });
        const data = await res.json();
        setTracking(data.trackingNumber);
        setLabelUrl(data.labelUrl);
    } catch (e) {
        alert('Chyba při vytváření štítku');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mt-6">
        <h3 className="text-lg font-bold mb-4">Logistika</h3>
        
        {tracking ? (
            <div>
                <div className="mb-2">
                    <span className="text-gray-500">Zásilkovna: </span>
                    <span className="font-mono font-bold">{tracking}</span>
                </div>
                <div className="flex gap-2">
                    <a href={labelUrl} target="_blank" className="text-blue-600 underline">Stáhnout štítek (PDF)</a>
                    <span className="text-gray-300">|</span>
                    <a href={`https://tracking.packeta.com/cs/?id=${tracking}`} target="_blank" className="text-blue-600 underline">Sledovat zásilku</a>
                </div>
            </div>
        ) : (
            <div>
                <p className="text-sm text-gray-500 mb-4">Objednávka je připravena k expedici.</p>
                <button 
                    onClick={createLabel} 
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Generuji...' : 'Vytvořit štítek (Zásilkovna)'}
                </button>
            </div>
        )}
    </div>
  );
}
