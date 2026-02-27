'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ShoppingCart, Webhook } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IntegrationsPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [eventType, setEventType] = useState('INVOICE_PAID');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrg) {
        setLoading(true);
        fetchWithAuth(`/api/webhooks?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setWebhooks)
            .catch(() => {
              toast.error('Nepodařilo se načíst webhooky.');
            })
            .finally(() => setLoading(false));
    }
  }, [currentOrg]);

  const addWebhook = async () => {
      if (!newUrl || !currentOrg) {
          toast.error('Vyplňte URL webhooku.');
          return;
      }
      const toastId = toast.loading('Přidávám webhook...');
      try {
        const res = await fetchWithAuth('/api/webhooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organizationId: currentOrg.id,
                url: newUrl,
                events: [eventType],
            })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message || 'Chyba při přidávání webhooku.', { id: toastId });
          return;
        }
        toast.success('Webhook úspěšně přidán!', { id: toastId });
        setNewUrl('');
        const refreshed = await fetchWithAuth(`/api/webhooks?organizationId=${currentOrg.id}`).then(r => r.json());
        setWebhooks(refreshed);
      } catch (e) {
        toast.error('Chyba při přidávání webhooku.', { id: toastId });
      }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Integrace a notifikace</h1>
        <p className="text-muted-foreground">
          Nastavte webhooky pro notifikace a integraci s externími systémy.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Slack / Discord notifikace
            </CardTitle>
            <CardDescription>
              Vložte Webhook URL ze Slacku nebo Discordu. Vulpi vás upozorní, když dorazí platba.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="flex-1"
              />
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Vyberte událost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVOICE_PAID">Platba přijata</SelectItem>
                  <SelectItem value="INVOICE_SENT">Faktura odeslána</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addWebhook} disabled={!newUrl}>
                Přidat webhook
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Načítám webhooky…</div>
            ) : (
              <div className="space-y-2">
                {webhooks.map(hook => (
                  <div
                    key={hook.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {hook.url}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hook.events?.map((evt: string) => (
                        <span
                          key={evt}
                          className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {webhooks.length === 0 && (
                  <EmptyState
                    title="Žádné webhooky"
                    description="Zatím nemáte nastavené žádné notifikace."
                    icon={Webhook}
                    className="py-8"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              E-shop import (WooCommerce / Shoptet)
            </CardTitle>
            <CardDescription>
              Nastavte tento URL jako webhook ve vašem e-shopu pro událost „Order Created“.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded font-mono text-sm break-all text-muted-foreground select-all">
              https://api.vulpi.cz/api/import/order?organizationId={currentOrg?.id}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
