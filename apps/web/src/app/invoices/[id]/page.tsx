'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import IsdsWidget from '@/features/invoices/components/isds-widget';
import { useInvoice } from '@/features/invoices/hooks/use-invoice';
import { useSendInvoice } from '@/features/invoices/hooks/use-send-invoice';

export default function InvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const { data: invoice, loading, mutate } = useInvoice(id);
  const { send, sending } = useSendInvoice();
  
  const [lang, setLang] = useState(searchParams.get('lang') || 'cs');

  const sendEmail = async () => {
    if (!invoice) return;
    if (!confirm(`Opravdu chcete odeslat fakturu na ${invoice.client?.email}?`)) return;

    try {
        await send(invoice.id);
        alert('Faktura byla úspěšně odeslána.');
        // Refresh invoice status
        mutate({ ...invoice, status: 'sent' });
    } catch (err: any) {
        alert(err.message);
    }
  };

  if (loading) return <div className="p-8">Načítání...</div>;
  if (!invoice) return <div className="p-8">Faktura nenalezena</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Faktura {invoice.invoiceNumber}</h1>
          <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
            invoice.status === 'draft' ? 'bg-gray-200 text-gray-800' : 
            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex gap-3 items-center">
            <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
            >
                <option value="cs">Čeština</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
            </select>
            <Link 
              href={`/api/invoices/${invoice.id}/pdf?lang=${lang}`} 
              target="_blank"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Stáhnout PDF
            </Link>
            <button 
                onClick={sendEmail}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Odesílám...' : 'Odeslat klientovi'}
            </button>
        </div>
        
        {/* ISDS Widget */}
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
             <h3 className="text-sm font-bold mb-2">Komunikace se státem (ISDS)</h3>
             <IsdsWidget invoice={invoice} />
        </div>

      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        {/* Preview Frame */}
        <div className="aspect-[1/1.4] w-full bg-gray-100 flex items-center justify-center">
            <iframe 
                src={`/api/invoices/${invoice.id}/pdf?lang=${lang}`} 
                className="w-full h-full"
                title="PDF Preview"
            />
        </div>
      </div>
    </div>
  );
}
