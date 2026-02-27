'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Tag, TrendingUp, Users, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function MarketingPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', type: 'PERCENTAGE', value: 0, usageLimit: 100 });

  useEffect(() => {
    if (currentOrg) {
        fetchWithAuth(`/api/marketing/discounts?organizationId=${currentOrg.id}`)
            .then(res => res.json())
            .then(setDiscounts);
    }
  }, [currentOrg]);

  const createCode = async () => {
      await fetchWithAuth('/api/marketing/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newCode, organizationId: currentOrg?.id })
      });
      setShowForm(false);
      // Refresh
      const res = await fetchWithAuth(`/api/marketing/discounts?organizationId=${currentOrg?.id}`);
      setDiscounts(await res.json());
  };

  const deleteCode = async (id: string) => {
      try {
          const res = await fetchWithAuth(`/api/marketing/discounts/${id}?organizationId=${currentOrg?.id}`, {
              method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete discount');
          
          setDiscounts(discounts.filter(d => d.id !== id));
          toast.success('Slevový kód smazán');
      } catch (error) {
          toast.error('Chyba při mazání slevového kódu');
          console.error(error);
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing & Slevy</h1>
            <p className="text-muted-foreground mt-2">Správa slevových kódů a automatických kampaní.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" /> Nový slevový kód
          </Button>
      </div>

      {showForm && (
          <Card>
              <CardHeader>
                  <CardTitle>Vytvořit nový slevový kód</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Kód slevy</Label>
                          <Input 
                            placeholder="Např. VANOCE2024" 
                            className="uppercase" 
                            value={newCode.code}
                            onChange={e => setNewCode({...newCode, code: e.target.value.toUpperCase()})} 
                          />
                      </div>
                      <div className="flex gap-4">
                          <div className="w-1/2 space-y-2">
                              <Label>Typ slevy</Label>
                              <Select 
                                value={newCode.type} 
                                onValueChange={val => setNewCode({...newCode, type: val})}
                              >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Procento (%)</SelectItem>
                                    <SelectItem value="FIXED">Částka (CZK)</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                          <div className="w-1/2 space-y-2">
                              <Label>Hodnota</Label>
                              <Input 
                                type="number" 
                                placeholder="Hodnota" 
                                value={newCode.value}
                                onChange={e => setNewCode({...newCode, value: Number(e.target.value)})} 
                              />
                          </div>
                      </div>
                  </div>
                  <Button onClick={createCode} className="mt-4 bg-green-600 hover:bg-green-700">
                      Uložit kód
                  </Button>
              </CardContent>
          </Card>
      )}

      <div className="grid gap-6">
          {discounts.map(d => (
              <Card key={d.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                              <Tag className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold font-mono text-primary">{d.code}</h3>
                              <p className="text-muted-foreground">
                                  {d.type === 'PERCENTAGE' ? `${d.value}% sleva` : `${d.value} CZK sleva`}
                              </p>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Použito</div>
                            <div className="font-bold text-lg">{d.usageCount} / {d.usageLimit || '∞'}</div>
                        </div>

                        <div className="text-right border-l pl-8">
                            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                ROI <TrendingUp className="h-3 w-3" />
                            </div>
                            <div className={`font-bold text-xl ${Number(d.totalRevenueGenerated) > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {Number(d.totalDiscountGiven) > 0 
                                    ? ((Number(d.totalRevenueGenerated) / Number(d.totalDiscountGiven)) * 100).toFixed(0) + '%' 
                                    : '0%'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Sleva: {Number(d.totalDiscountGiven).toFixed(0)} | Tržba: {Number(d.totalRevenueGenerated).toFixed(0)}
                            </div>
                        </div>

                        <div className="border-l pl-4">
                            <ConfirmDialog
                                trigger={
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                }
                                title="Smazat slevový kód?"
                                description={`Opravdu chcete smazat kód "${d.code}"?`}
                                onConfirm={() => deleteCode(d.id)}
                                variant="destructive"
                                actionLabel="Smazat"
                            />
                        </div>
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>
      
      <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Automatické oslovení (Retention)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
                Systém automaticky kontroluje klienty, kteří u vás nenakoupili déle než 3 měsíce.
                Pokud mají souhlas s marketingem, odešle jim e-mail s nabídkou.
            </p>
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-green-700 dark:text-green-400">Aktivní (Denně v 10:00)</span>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
