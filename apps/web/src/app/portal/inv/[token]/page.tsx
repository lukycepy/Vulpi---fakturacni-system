'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (token) {
        fetch(`/api/portal/invoice/${token}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => setInvoice(data))
            .catch(() => setInvoice(null))
            .finally(() => setLoading(false));
    }
  }, [token]);

  const handlePayment = async () => {
      alert('Přesměrování na platební bránu (Stripe Mock)...');
      // In real app: window.location.href = res.paymentUrl
  };

  const submitComment = async () => {
      if (!comment.trim()) return;
      await fetch(`/api/portal/invoice/${token}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: comment })
      });
      setComment('');
      // Reload comments
      const res = await fetch(`/api/portal/invoice/${token}`);
      const data = await res.json();
      setInvoice(data);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Načítání...</div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center">Faktura neexistuje nebo vypršel odkaz.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <div>
                  <h1 className="text-2xl font-bold">{invoice.organization.name}</h1>
                  <div className="text-blue-100 text-sm">Faktura {invoice.invoiceNumber}</div>
              </div>
              <div className="text-right">
                  <div className="text-3xl font-bold">
                      {Number(invoice.totalAmount).toFixed(2)} {invoice.currency}
                  </div>
                  <div className="text-blue-100 text-sm">
                      Splatnost: {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
              </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-b flex gap-4 bg-gray-50 dark:bg-gray-700">
              <button 
                  onClick={handlePayment}
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold flex-1"
              >
                  Zaplatit kartou
              </button>
              <a 
                  href={`/api/invoices/${invoice.id}/pdf`} 
                  target="_blank"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded shadow-sm hover:bg-gray-50 flex-1 text-center"
              >
                  Stáhnout PDF
              </a>
              <a 
                  href={`/api/invoices/${invoice.id}/isdoc`} 
                  target="_blank"
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded shadow-sm hover:bg-gray-50 flex-1 text-center"
              >
                  Stáhnout ISDOC
              </a>
          </div>

          {/* Details */}
          <div className="p-6">
              <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                      <h3 className="text-gray-500 text-sm uppercase mb-1">Dodavatel</h3>
                      <div className="font-bold">{invoice.organization.name}</div>
                      <div className="text-gray-600">{invoice.organization.address}</div>
                      <div className="text-sm mt-2">IČO: {invoice.organization.ico}</div>
                      {invoice.organization.bankAccounts?.[0] && (
                          <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100 text-sm">
                              Účet: <strong>{invoice.organization.bankAccounts[0].accountNumber} / {invoice.organization.bankAccounts[0].bankCode}</strong>
                          </div>
                      )}
                  </div>
                  <div>
                      <h3 className="text-gray-500 text-sm uppercase mb-1">Odběratel</h3>
                      <div className="font-bold">{invoice.client.name}</div>
                      <div className="text-gray-600">{invoice.client.address}</div>
                      <div className="text-sm mt-2">IČO: {invoice.client.ico}</div>
                  </div>
              </div>

              <table className="w-full mb-8">
                  <thead>
                      <tr className="border-b text-sm text-gray-500">
                          <th className="text-left py-2">Položka</th>
                          <th className="text-right py-2">Množství</th>
                          <th className="text-right py-2">Cena</th>
                          <th className="text-right py-2">Celkem</th>
                      </tr>
                  </thead>
                  <tbody>
                      {invoice.items.map((item: any) => (
                          <tr key={item.id} className="border-b">
                              <td className="py-2">{item.description}</td>
                              <td className="text-right py-2">{item.quantity} {item.unit}</td>
                              <td className="text-right py-2">{Number(item.unitPrice).toFixed(2)}</td>
                              <td className="text-right py-2 font-medium">{Number(item.totalPrice).toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 border-t">
              <h3 className="font-bold mb-4">Máte dotaz k faktuře?</h3>
              <div className="space-y-4 mb-4">
                  {invoice.comments.map((c: any) => (
                      <div 
                          key={c.id} 
                          className={`p-3 rounded text-sm ${
                              c.isAi 
                                  ? 'bg-purple-100 mr-8 border border-purple-200 text-purple-900' 
                                  : c.isClient 
                                      ? 'bg-blue-100 ml-8 text-blue-900' 
                                      : 'bg-white mr-8 border text-gray-900'
                          }`}
                      >
                          <div className="font-bold text-xs mb-1 flex items-center gap-1">
                              {c.isAi ? '🤖 Vulpi AI' : c.isClient ? 'Vy (Klient)' : invoice.organization.name}
                          </div>
                          {c.content}
                      </div>
                  ))}
                  {invoice.comments.length === 0 && <div className="text-gray-500 text-sm italic">Žádné komentáře.</div>}
              </div>
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Napište zprávu..." 
                      className="flex-1 border rounded px-3 py-2"
                  />
                  <button onClick={submitComment} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Odeslat
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
