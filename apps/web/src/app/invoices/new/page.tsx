'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useRouter } from 'next/navigation';
import { useCreateInvoice } from '@/features/invoices/hooks/use-create-invoice';
import { InvoiceFormHeader } from '@/features/invoices/components/invoice-form-header';
import { InvoiceItemsTable } from '@/features/invoices/components/invoice-items-table';
import { InvoiceItem } from '@/features/invoices/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
    if (!currentOrg) return;

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
      
      router.back(); 
    } catch (err: any) {
      // Error handled in hook via toast
      console.error(err);
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
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
            >
                Zrušit
            </Button>
            <Button 
                type="submit" 
                disabled={loading}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Ukládám...' : 'Vytvořit fakturu'}
            </Button>
        </div>
      </form>
    </div>
  );
}
