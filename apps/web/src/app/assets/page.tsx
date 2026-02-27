'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/auth-provider';
import { Plus, Check, Box, Calculator, QrCode, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function AssetsPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
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
        const res = await fetchWithAuth(`/api/assets?organizationId=${currentOrg?.id}`);
        if (res.ok) setAssets(await res.json());
    } catch (error) {
        console.error('Failed to load assets:', error);
        toast.error('Nepodařilo se načíst majetek');
    }
  };

  const handleDeleteAsset = async (id: string) => {
      try {
          const res = await fetchWithAuth(`/api/assets/${id}?organizationId=${currentOrg?.id}`, {
              method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete asset');
          
          loadAssets();
          toast.success('Majetek smazán');
      } catch (error) {
          console.error(error);
          toast.error('Chyba při mazání majetku');
      }
  };

  const handleSubmitAsset = async () => {
      if (!newAsset.name || !newAsset.inventoryNumber || !newAsset.acquisitionPrice) {
          toast.error('Vyplňte prosím všechna povinná pole');
          return;
      }

      setLoading(true);
      try {
          const res = await fetchWithAuth('/api/assets', {
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
          const res = await fetchWithAuth(`/api/assets/depreciations/${depId}/post`, { method: 'POST' });
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
                  <Label>Název majetku</Label>
                  <Input 
                    placeholder="Např. Automobil Škoda Octavia" 
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <Label>Inventární číslo</Label>
                  <Input 
                    placeholder="INV-2024-001" 
                    value={newAsset.inventoryNumber}
                    onChange={e => setNewAsset({...newAsset, inventoryNumber: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <Label>Datum pořízení</Label>
                  <Input 
                    type="date" 
                    value={newAsset.acquisitionDate}
                    onChange={e => setNewAsset({...newAsset, acquisitionDate: e.target.value})} 
                  />
              </div>
              <div className="space-y-2">
                  <Label>Pořizovací cena (CZK)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newAsset.acquisitionPrice || ''}
                    onChange={e => setNewAsset({...newAsset, acquisitionPrice: Number(e.target.value)})} 
                  />
              </div>
              <div className="space-y-2 md:col-span-2">
                  <Label>Odpisová skupina</Label>
                  <Select 
                    value={String(newAsset.depreciationGroup)}
                    onValueChange={(val) => setNewAsset({...newAsset, depreciationGroup: Number(val)})}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="Vyberte skupinu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Skupina 1 (3 roky) - PC, Nástroje, Malá technika</SelectItem>
                      <SelectItem value="2">Skupina 2 (5 let) - Automobily, Nábytek, Stroje</SelectItem>
                      <SelectItem value="3">Skupina 3 (10 let) - Klimatizace, Trezory, Výtahy</SelectItem>
                      <SelectItem value="4">Skupina 4 (20 let) - Budovy ze dřeva a plastů</SelectItem>
                      <SelectItem value="5">Skupina 5 (30 let) - Budovy, Dálnice</SelectItem>
                      <SelectItem value="6">Skupina 6 (50 let) - Administrativní budovy, Hotely</SelectItem>
                    </SelectContent>
                  </Select>
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
                          <div className="hidden sm:flex items-center gap-4">
                              <div className="p-1 bg-white rounded border">
                                  <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ASSET:${asset.id}`} 
                                      alt="QR kód majetku" 
                                      className="w-16 h-16"
                                  />
                              </div>
                              <ConfirmDialog
                                  trigger={
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                          <Trash2 className="h-5 w-5" />
                                      </Button>
                                  }
                                  title="Smazat majetek?"
                                  description={`Opravdu chcete smazat majetek "${asset.name}"? Tato akce je nevratná a smaže i historii odpisů.`}
                                  onConfirm={() => handleDeleteAsset(asset.id)}
                                  variant="destructive"
                                  actionLabel="Smazat"
                              />
                          </div>
                      </div>
                  </CardHeader>

                  {/* Depreciation Schedule */}
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader className="bg-muted/50">
                              <TableRow>
                                  <TableHead className="w-20">Rok</TableHead>
                                  <TableHead>Částka odpisu</TableHead>
                                  <TableHead>Stav</TableHead>
                                  <TableHead className="text-right">Akce</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {asset.depreciations.map((dep: any) => (
                                  <TableRow key={dep.id}>
                                      <TableCell className="font-bold text-muted-foreground">{dep.year}</TableCell>
                                      <TableCell className="font-mono">{formatCurrency(Number(dep.amount))}</TableCell>
                                      <TableCell>
                                          {dep.isPosted ? (
                                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                  <Check className="w-3 h-3 mr-1" /> ZAÚČTOVÁNO
                                              </Badge>
                                          ) : (
                                              <Badge variant="outline" className="text-muted-foreground">
                                                  Plánováno
                                              </Badge>
                                          )}
                                      </TableCell>
                                      <TableCell className="text-right">
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
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
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
