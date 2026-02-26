
'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useRouter } from 'next/navigation';
import { useCreateInvoice } from '@/features/invoices/hooks/use-create-invoice';
import { InvoiceFormHeader } from '@/features/invoices/components/invoice-form-header';
import { InvoiceItemsTable } from '@/features/invoices/components/invoice-items-table';
import { InvoiceItem } from '@/features/invoices/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const { create, loading } = useCreateInvoice();
  
  // Form State
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxableSupplyDate, setTaxableSupplyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit: 'ks', unitPrice: 0, vatRate: 21 }
  ]);

  // Temporary mock clients
  const [clients, setClients] = useState<any[]>([]); 

  useEffect(() => {
     setClients([
         { id: 'client-1', name: 'Alza.cz a.s.' },
         { id: 'client-2', name: 'Rohlik.cz Finance a.s.' }
     ]);
     setClientId('client-1');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return alert('Vyberte organizaci');

    try {
      await create({
          organizationId: currentOrg.id,
          clientId,
          issueDate,
          taxableSupplyDate,
          dueDate,
          items: items.map(i => ({
              ...i,
              quantity: Number(i.quantity),
              unitPrice: Number(i.unitPrice),
              vatRate: Number(i.vatRate)
          })),
          currency: 'CZK',
          exchangeRate: 1
      });
      
      // We don't have the ID here because useCreateInvoice returns void or we need to update it
      // Let's assume for now we redirect to list or just back
      router.back(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nová faktura</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <InvoiceFormHeader 
            clientId={clientId} setClientId={setClientId} clients={clients}
            issueDate={issueDate} setIssueDate={setIssueDate}
            taxableSupplyDate={taxableSupplyDate} setTaxableSupplyDate={setTaxableSupplyDate}
            dueDate={dueDate} setDueDate={setDueDate}
        />

        <InvoiceItemsTable items={items} setItems={setItems} />

        <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Zrušit</button>
            <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Ukládám...' : 'Vytvořit fakturu'}
            </button>
        </div>
      </form>
    </div>
  );
}
