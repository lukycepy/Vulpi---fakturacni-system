'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, Plus, Route, Loader2 } from 'lucide-react';

export default function TravelPage() {
  const { currentOrg } = useOrganization();
  const [orders, setOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newOrder, setNewOrder] = useState({
      destination: '',
      purpose: '',
      vehicle: 'company_car',
      departureTime: '',
      arrivalTime: '',
      distanceKm: 0
  });

  const refresh = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/travel?organizationId=${currentOrg.id}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Nepodařilo se načíst cestovní příkazy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [currentOrg]);

  const submitOrder = async () => {
      if (!currentOrg) return;
      if (!newOrder.destination.trim() || !newOrder.purpose.trim()) {
        toast.error('Vyplňte cíl cesty a účel.');
        return;
      }
      if (!newOrder.departureTime || !newOrder.arrivalTime) {
        toast.error('Vyplňte čas odjezdu a příjezdu.');
        return;
      }
      if (newOrder.vehicle === 'private_car' && (!newOrder.distanceKm || newOrder.distanceKm <= 0)) {
        toast.error('Zadejte vzdálenost v kilometrech.');
        return;
      }

      setSubmitting(true);
      const toastId = toast.loading('Odesílám cestovní příkaz...');
      try {
        const res = await fetch('/api/travel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newOrder,
                distanceKm: Number(newOrder.distanceKm) || 0,
                organizationId: currentOrg.id,
                userId: 'user-1',
            })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message || 'Chyba při odesílání cestovního příkazu.', { id: toastId });
          return;
        }
        toast.success('Cestovní příkaz odeslán.', { id: toastId });
        setShowForm(false);
        setNewOrder({
          destination: '',
          purpose: '',
          vehicle: 'company_car',
          departureTime: '',
          arrivalTime: '',
          distanceKm: 0
        });
        await refresh();
      } catch {
        toast.error('Chyba při odesílání cestovního příkazu.', { id: toastId });
      } finally {
        setSubmitting(false);
      }
  };

  const approveOrder = async (id: string) => {
      if (!currentOrg) return;
      const toastId = toast.loading('Schvaluji cestovní příkaz...');
      try {
        const res = await fetch(`/api/travel/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approverId: 'admin-1' })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message || 'Schválení se nezdařilo.', { id: toastId });
          return;
        }
        toast.success('Cestovní příkaz schválen.', { id: toastId });
        await refresh();
      } catch {
        toast.error('Schválení se nezdařilo.', { id: toastId });
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Cestovní příkazy</h1>
          <p className="text-muted-foreground">
            Vytvářejte a schvalujte cestovní příkazy. Diety a náhrady se dopočítají na pozadí.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!currentOrg}>
          <Plus className="mr-2 h-4 w-4" />
          Nový cestovní příkaz
        </Button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nový cestovní příkaz"
        description="Vyplňte základní údaje o cestě."
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
              Zrušit
            </Button>
            <Button variant="green" onClick={submitOrder} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Odeslat
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <div className="text-sm font-medium">Cíl cesty</div>
            <Input
              value={newOrder.destination}
              onChange={e => setNewOrder({ ...newOrder, destination: e.target.value })}
              placeholder="Praha"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="text-sm font-medium">Účel</div>
            <Input
              value={newOrder.purpose}
              onChange={e => setNewOrder({ ...newOrder, purpose: e.target.value })}
              placeholder="Schůzka s klientem"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Doprava</div>
            <Select
              value={newOrder.vehicle}
              onValueChange={val => setNewOrder({ ...newOrder, vehicle: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vyberte dopravu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_car">Firemní auto</SelectItem>
                <SelectItem value="private_car">Soukromé auto</SelectItem>
                <SelectItem value="train">Vlak / bus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Vzdálenost (km)</div>
            <Input
              type="number"
              value={newOrder.distanceKm}
              onChange={e => setNewOrder({ ...newOrder, distanceKm: Number(e.target.value) })}
              disabled={newOrder.vehicle !== 'private_car'}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Odjezd</div>
            <Input
              type="datetime-local"
              value={newOrder.departureTime}
              onChange={e => setNewOrder({ ...newOrder, departureTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Příjezd</div>
            <Input
              type="datetime-local"
              value={newOrder.arrivalTime}
              onChange={e => setNewOrder({ ...newOrder, arrivalTime: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Přehled příkazů
          </CardTitle>
          <CardDescription>
            Zobrazuje se posledních {orders.length} záznamů pro vybranou organizaci.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Žádné cestovní příkazy"
                description="Zatím nemáte vytvořený žádný cestovní příkaz."
                icon={Route}
                action={{
                  label: "Vytvořit první",
                  onClick: () => setShowForm(true),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Zaměstnanec</TableHead>
                    <TableHead>Cíl & účel</TableHead>
                    <TableHead>Doprava</TableHead>
                    <TableHead className="text-right">Diety</TableHead>
                    <TableHead className="text-right">Celkem</TableHead>
                    <TableHead>Stav</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {orders.map(order => {
                  const status: string = order.status || 'SUBMITTED';
                  const badgeVariant =
                    status === 'APPROVED'
                      ? 'success'
                      : status === 'REJECTED'
                        ? 'destructive'
                        : 'warning';

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="text-muted-foreground">
                        {order.departureTime ? new Date(order.departureTime).toLocaleDateString('cs-CZ') : '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.user?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.destination || '—'}</div>
                        <div className="text-xs text-muted-foreground">{order.purpose || ''}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.vehicle || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(order.mealAllowance || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {Number(order.totalAmount || 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant as any}>
                          {status === 'APPROVED' ? 'Schváleno' : status === 'REJECTED' ? 'Zamítnuto' : 'Čeká na schválení'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {status === 'SUBMITTED' ? (
                          <ConfirmDialog
                            trigger={
                              <Button size="sm" variant="blue">
                                <Check className="mr-2 h-4 w-4" />
                                Schválit
                              </Button>
                            }
                            title="Schválit cestovní příkaz?"
                            description="Potvrďte schválení cestovního příkazu. Akce změní jeho stav na schváleno."
                            actionLabel="Schválit"
                            onConfirm={() => approveOrder(order.id)}
                          />
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Hotovo
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
