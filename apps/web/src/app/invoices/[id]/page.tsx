'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import IsdsWidget from '@/features/invoices/components/isds-widget';
import { useInvoice } from '@/features/invoices/hooks/use-invoice';
import { useSendInvoice } from '@/features/invoices/hooks/use-send-invoice';
import { useDeleteInvoice } from '@/features/invoices/hooks/use-delete-invoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Loader2, Download, Send, Globe, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const { data: invoice, loading, mutate } = useInvoice(id);
  const { send, sending } = useSendInvoice();
  const { deleteInvoice, deleting } = useDeleteInvoice();
  
  const [lang, setLang] = useState(searchParams.get('lang') || 'cs');

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
        await send(invoice.id);
        toast.success('Faktura byla úspěšně odeslána.');
        // Refresh invoice status
        mutate({ ...invoice, status: 'sent' });
    } catch (err: any) {
        toast.error(err.message || 'Chyba při odesílání faktury');
    }
  };

  const handleDelete = async () => {
      if (!invoice) return;
      try {
          await deleteInvoice(invoice.id);
          router.push('/invoices');
      } catch (error) {
          // Error handled in hook
      }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Faktura nenalezena</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
              Faktura {invoice.invoiceNumber}
              <Badge variant={
                invoice.status === 'draft' ? 'secondary' : 
                invoice.status === 'sent' ? 'default' :
                invoice.status === 'paid' ? 'success' : 'destructive'
              }>
                {invoice.status === 'draft' ? 'Návrh' : 
                 invoice.status === 'sent' ? 'Odesláno' :
                 invoice.status === 'paid' ? 'Zaplaceno' : 'Po splatnosti'}
              </Badge>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
                <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 w-[130px]"
                    )}
                >
                    <option value="cs">Čeština</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
            
            <Button asChild variant="outline">
                <Link 
                  href={`/api/invoices/${invoice.id}/pdf?lang=${lang}`} 
                  target="_blank"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Stáhnout PDF
                </Link>
            </Button>
            
            <ConfirmDialog
                trigger={
                    <Button 
                        disabled={sending}
                        variant="blue"
                    >
                        {sending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                        {sending ? 'Odesílám...' : 'Odeslat klientovi'}
                    </Button>
                }
                title="Odeslat fakturu?"
                description={`Opravdu chcete odeslat fakturu na ${invoice.client?.email}?`}
                onConfirm={handleSendEmail}
                actionLabel="Odeslat"
            />

            <ConfirmDialog
                trigger={
                    <Button variant="destructive" disabled={deleting}>
                        {deleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Smazat
                    </Button>
                }
                title="Smazat fakturu?"
                description="Tato akce je nevratná. Opravdu chcete smazat tuto fakturu?"
                onConfirm={handleDelete}
                variant="destructive"
                actionLabel="Smazat"
            />
        </div>
      </div>
        
      {/* ISDS Widget */}
      <Card className="mb-6">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <span>🏛️</span> Komunikace se státem (ISDS)
                </CardTitle>
             </CardHeader>
             <CardContent>
                <IsdsWidget invoice={invoice} />
             </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-lg">
        {/* Preview Frame */}
        <div className="aspect-[1/1.4] w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <iframe 
                src={`/api/invoices/${invoice.id}/pdf?lang=${lang}`} 
                className="w-full h-full"
                title="PDF Preview"
            />
        </div>
      </Card>
    </div>
  );
}
