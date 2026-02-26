'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Check, Box, Calculator, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function AssetsPage() {
  const { currentOrg } = useOrganization();
  const [assets, setAssets] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
      name: '',
      inventoryNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionPrice: 0,
      depreciationGroup: 1,
      depreciationMethod: 'STRAIGHT'
  });

  useEffect(() => {
    if (currentOrg) {
        loadAssets();
    }
  }, [currentOrg]);

  const loadAssets = async () => {
    try {
        const res = await fetch(`/api/assets?organizationId=${currentOrg?.id}`);
        if (res.ok) setAssets(await res.json());
    } catch (error) {
        console.error('Failed to load assets:', error);
        toast.error('Nepodařilo se načíst majetek');
    }
  };

  const handleSubmitAsset = async () => {
      if (!newAsset.name || !newAsset.inventoryNumber || !newAsset.acquisitionPrice) {
          toast.error('Vyplňte prosím všechna povinná pole');
          return;
      }

      setLoading(true);
      try {
          const res = await fetch('/api/assets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...newAsset, organizationId: currentOrg?.id })
          });
          
          if (!res.ok) throw new Error('Failed to create asset');

          setIsFormOpen(false);
          loadAssets();
          toast.success('Majetek úspěšně přidán');
          
          // Reset form
          setNewAsset({
              name: '',
              inventoryNumber: '',
              acquisitionDate: new Date().toISOString().split('T')[0],
              acquisitionPrice: 0,
              depreciationGroup: 1,
              depreciationMethod: 'STRAIGHT'
          });
      } catch (error) {
          console.error(error);
          toast.error('Chyba při ukládání majetku');
      } finally {
          setLoading(false);
      }
  };

  const handlePostDepreciation = async (depId: string) => {
      try {
          const res = await fetch(`/api/assets/depreciations/${depId}/post`, { method: 'POST' });
          if (!res.ok) throw new Error('Failed to post depreciation');
          
          loadAssets();
          toast.success('Odpis úspěšně zaúčtován');
      } catch (error) {
          console.error(error);
          toast.error('Chyba při účtování odpisu');
      }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
  };

  if (!currentOrg) return <div className="p-6">Vyberte organizaci</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dlouhodobý majetek</h1>
            <p className="text-muted-foreground mt-2">
                Evidence a odepisování dlouhodobého hmotného a nehmotného majetku.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nový majetek
          </Button>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Zadat nový majetek"
        description="Vytvořte novou kartu majetku pro automatický výpočet odpisů."
        footer={
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Zrušit</Button>
                <Button onClick={handleSubmitAsset} disabled={loading}>
                    {loading ? 'Ukládání...' : 'Uložit majetek'}
                </Button>
            </div>
        }
      >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Název majetku</label>
                  <Input 
                    placeholder="Např. Automobil Škoda Octavia" 
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium">Inventární číslo</label>
                  <Input 
                    placeholder="INV-2024-001" 
                    value={newAsset.inventoryNumber}
                    onChange={e => setNewAsset({...newAsset, inventoryNumber: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium">Datum pořízení</label>
                  <Input 
                    type="date" 
                    value={newAsset.acquisitionDate}
                    onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium">Pořizovací cena (CZK)</label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newAsset.acquisitionPrice || ''}
                    onChange={e => setNewAsset({...newAsset, acquisitionPrice: Number(e.target.value)})} 
                  />
              </div>
              <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Odpisová skupina</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAsset.depreciationGroup}
                    onChange={e => setNewAsset({...newAsset, depreciationGroup: Number(e.target.value)})}
                  >
                      <option value="1">Skupina 1 (3 roky) - PC, Nástroje, Malá technika</option>
                      <option value="2">Skupina 2 (5 let) - Automobily, Nábytek, Stroje</option>
                      <option value="3">Skupina 3 (10 let) - Klimatizace, Trezory, Výtahy</option>
                      <option value="4">Skupina 4 (20 let) - Budovy ze dřeva a plastů</option>
                      <option value="5">Skupina 5 (30 let) - Budovy, Dálnice</option>
                      <option value="6">Skupina 6 (50 let) - Administrativní budovy, Hotely</option>
                  </select>
              </div>
          </div>
      </Modal>

      <div className="space-y-6">
          {assets.length > 0 ? (
              assets.map(asset => (
              <Card key={asset.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-3 mb-1">
                                  <CardTitle className="text-xl">{asset.name}</CardTitle>
                                  <Badge variant="outline" className="bg-background">
                                      {asset.inventoryNumber}
                                  </Badge>
                              </div>
                              <CardDescription className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                                  <span>Pořízeno: {new Date(asset.acquisitionDate).toLocaleDateString('cs-CZ')}</span>
                                  <span>Cena: <span className="font-medium text-foreground">{formatCurrency(Number(asset.acquisitionPrice))}</span></span>
                                  <span>Zůstatková hodnota: <span className="font-medium text-foreground">{formatCurrency(Number(asset.residualValue))}</span></span>
                              </CardDescription>
                          </div>
                          <div className="hidden sm:block p-1 bg-white rounded border">
                              <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ASSET:${asset.id}`} 
                                  alt="QR kód majetku" 
                                  className="w-16 h-16"
                              />
                          </div>
                      </div>
                  </CardHeader>

                  {/* Depreciation Schedule */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 border-b">
                              <tr>
                                  <th className="p-3 font-medium text-muted-foreground w-20">Rok</th>
                                  <th className="p-3 font-medium text-muted-foreground">Částka odpisu</th>
                                  <th className="p-3 font-medium text-muted-foreground">Stav</th>
                                  <th className="p-3 font-medium text-muted-foreground text-right">Akce</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {asset.depreciations.map((dep: any) => (
                                  <tr key={dep.id} className="hover:bg-muted/30 transition-colors">
                                      <td className="p-3 font-bold text-muted-foreground">{dep.year}</td>
                                      <td className="p-3 font-mono">{formatCurrency(Number(dep.amount))}</td>
                                      <td className="p-3">
                                          {dep.isPosted ? (
                                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                  <Check className="w-3 h-3 mr-1" /> ZAÚČTOVÁNO
                                              </Badge>
                                          ) : (
                                              <Badge variant="outline" className="text-muted-foreground">
                                                  Plánováno
                                              </Badge>
                                          )}
                                      </td>
                                      <td className="p-3 text-right">
                                          {!dep.isPosted && new Date().getFullYear() >= dep.year && (
                                              <ConfirmDialog
                                                  trigger={
                                                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                          <Calculator className="w-4 h-4 mr-2" />
                                                          Zaúčtovat
                                                      </Button>
                                                  }
                                                  title="Zaúčtovat odpis?"
                                                  description={`Opravdu chcete zaúčtovat odpis pro rok ${dep.year} ve výši ${formatCurrency(Number(dep.amount))}? Tato akce vytvoří účetní záznam.`}
                                                  onConfirm={() => handlePostDepreciation(dep.id)}
                                                  actionLabel="Zaúčtovat"
                                              />
                                          )}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </Card>
          ))) : (
              <EmptyState
                  icon={Box}
                  title="Žádný majetek v evidenci"
                  description="Začněte evidovat svůj dlouhodobý majetek pro automatický výpočet daňových odpisů."
                  action={{
                      label: "Nový majetek",
                      onClick: () => setIsFormOpen(true)
                  }}
              />
          )}
      </div>
    </div>
  );
}
