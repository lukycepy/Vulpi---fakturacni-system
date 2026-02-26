'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function IsdsWidget({ invoice }: { invoice: any }) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dataBoxId, setDataBoxId] = useState<string | null>(invoice.client?.dataBoxId || null);

  const checkIsds = async () => {
      if (!invoice.client?.ico) return;
      setChecking(true);
      try {
          const res = await fetchWithAuth('/api/isds/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ico: invoice.client.ico })
          });
          const data = await res.json();
          if (data.dataBoxId) {
              setDataBoxId(data.dataBoxId);
              toast.success(`Nalezena datová schránka: ${data.dataBoxId}`);
          } else {
              toast.error('Datová schránka nenalezena');
          }
      } catch (err: any) {
          toast.error('Chyba při ověřování ISDS: ' + (err.message || 'Neznámá chyba'));
      } finally {
          setChecking(false);
      }
  };

  const handleSendInvoice = async () => {
      if (!dataBoxId) return;

      setLoading(true);
      try {
          const res = await fetchWithAuth('/api/isds/send-invoice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ invoiceId: invoice.id, dataBoxId })
          });
          if (res.ok) {
              toast.success('Odesláno do Datové schránky');
          } else {
              const error = await res.json();
              toast.error('Chyba při odesílání: ' + (error.message || 'Neznámá chyba'));
          }
      } catch (err: any) {
          toast.error('Chyba při odesílání: ' + (err.message || 'Neznámá chyba'));
      } finally {
          setLoading(false);
      }
  };

  return (
      <div className="space-y-4">
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Datová schránka</span>
              {dataBoxId && <Badge variant="secondary" className="font-mono">{dataBoxId}</Badge>}
          </div>
          
          {!dataBoxId ? (
              <Button 
                  onClick={checkIsds}
                  disabled={checking || !invoice.client?.ico}
                  variant="link"
                  className="text-blue-600 p-0 h-auto font-normal hover:no-underline"
              >
                  {checking && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {checking ? 'Ověřuji...' : 'Ověřit existenci schránky (ISDS)'}
              </Button>
          ) : (
            <ConfirmDialog
                trigger={
                  <Button 
                      disabled={loading}
                      variant="outline"
                      className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                      size="sm"
                  >
                      {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      {loading ? 'Odesílám...' : 'Odeslat do schránky'}
                  </Button>
                }
                title="Odeslat do Datové schránky?"
                description={`Opravdu chcete odeslat fakturu do Datové schránky ${dataBoxId}?`}
                onConfirm={handleSendInvoice}
                actionLabel="Odeslat"
            />
          )}
      </div>
  );
}
