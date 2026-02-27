'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Download, Loader2, MessageSquare } from 'lucide-react';

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
      toast.info('Přesměrování na platební bránu (Stripe Mock)...');
      // In real app: window.location.href = res.paymentUrl
  };

  const submitComment = async () => {
      if (!comment.trim()) return;
      const toastId = toast.loading('Odesílám zprávu...');
      try {
        const res = await fetch(`/api/portal/invoice/${token}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: comment })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message || 'Zprávu se nepodařilo odeslat.', { id: toastId });
          return;
        }
        setComment('');
        const refreshed = await fetch(`/api/portal/invoice/${token}`).then(r => r.json());
        setInvoice(refreshed);
        toast.success('Zpráva odeslána.', { id: toastId });
      } catch {
        toast.error('Zprávu se nepodařilo odeslat.', { id: toastId });
      }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
      Faktura neexistuje nebo vypršel odkaz.
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-blue-600 text-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-blue-100 text-sm">Faktura</div>
              <h1 className="text-2xl font-bold">{invoice.organization?.name}</h1>
              <div className="text-blue-100 text-sm">Číslo: {invoice.invoiceNumber}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl font-bold">
                {Number(invoice.totalAmount).toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {invoice.currency}
              </div>
              <div className="text-blue-100 text-sm">
                Splatnost: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('cs-CZ') : '—'}
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handlePayment} className="flex-1" variant="green">
                <CreditCard className="mr-2 h-4 w-4" />
                Zaplatit kartou
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Stáhnout PDF
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/api/invoices/${invoice.id}/isdoc`} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Stáhnout ISDOC
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Dodavatel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{invoice.organization?.name}</div>
                  <div className="text-muted-foreground">{invoice.organization?.address}</div>
                  <div className="text-muted-foreground">IČO: {invoice.organization?.ico}</div>
                  {invoice.organization?.bankAccounts?.[0] && (
                    <div className="mt-3 rounded-md border bg-muted/30 p-3">
                      <div className="text-muted-foreground">Účet</div>
                      <div className="font-mono text-sm">
                        {invoice.organization.bankAccounts[0].accountNumber} / {invoice.organization.bankAccounts[0].bankCode}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Odběratel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{invoice.client?.name}</div>
                  <div className="text-muted-foreground">{invoice.client?.address}</div>
                  <div className="text-muted-foreground">IČO: {invoice.client?.ico}</div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Položka</TableHead>
                    <TableHead className="text-right">Množství</TableHead>
                    <TableHead className="text-right">Cena</TableHead>
                    <TableHead className="text-right">Celkem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(item.unitPrice).toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {Number(item.totalPrice).toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Dotazy k faktuře
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {invoice.comments?.map((c: any) => (
                <div
                  key={c.id}
                  className={[
                    "p-3 rounded-lg text-sm border",
                    c.isAi
                      ? "bg-purple-50 border-purple-200 text-purple-900"
                      : c.isClient
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-background",
                  ].join(" ")}
                >
                  <div className="font-medium text-xs mb-1 text-muted-foreground">
                    {c.isAi ? 'Vulpi AI' : c.isClient ? 'Vy' : invoice.organization?.name}
                  </div>
                  <div>{c.content}</div>
                </div>
              ))}
              {invoice.comments?.length === 0 && (
                <div className="text-sm text-muted-foreground">Žádné zprávy.</div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Napište zprávu…"
              />
              <Button onClick={submitComment} disabled={!comment.trim()}>
                Odeslat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
