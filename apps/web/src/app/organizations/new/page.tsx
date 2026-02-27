'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Loader2, Search, Building2, MapPin, Hash, Building, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AresData {
  name: string;
  ico: string;
  dic?: string;
  address: string;
}

export default function NewOrganizationPage() {
  const router = useRouter();
  const { refreshOrganizations } = useOrganization();
  const { fetchWithAuth, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("ares");
  const [ico, setIco] = useState('');
  const [aresData, setAresData] = useState<AresData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Manual form state
  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    dic: '',
    address: ''
  });

  const loadFromAres = async () => {
    if (!ico) return;
    if (ico.length < 8) {
      toast.error("IČO musí mít alespoň 8 znaků");
      return;
    }

    setLoading(true);
    setAresData(null);

    try {
      const res = await fetchWithAuth(`/api/organizations/ares/${ico}`);
      if (!res.ok) {
        let errorMessage = 'Chyba při načítání z ARES';
        try {
          const err = await res.json();
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = res.statusText || `Chyba serveru (${res.status})`;
        }
        throw new Error(errorMessage);
      }
      const data = await res.json().catch(() => {
        throw new Error('Neplatná odpověď serveru (JSON)');
      });
      setAresData(data);
      // Pre-fill manual form just in case user switches tabs
      setFormData({
        name: data.name || '',
        ico: data.ico || '',
        dic: data.dic || '',
        address: data.address || ''
      });
      toast.success('Data z ARES načtena');
    } catch (err: any) {
      toast.error(err.message || 'Chyba při načítání z ARES');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: any) => {
    setLoading(true);

    try {
      const res = await fetchWithAuth('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Chyba při vytváření organizace');
      }

      await refreshOrganizations();
      toast.success('Organizace úspěšně vytvořena');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Chyba při vytváření organizace');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ico) {
        toast.error("Vyplňte prosím alespoň Název a IČO");
        return;
    }
    createOrganization(formData);
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nová organizace</h1>
        <p className="text-muted-foreground">
          Vytvořte novou organizaci pro správu faktur a klientů.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ares">Načíst z ARES</TabsTrigger>
          <TabsTrigger value="manual">Ruční zadání</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ares" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Založit organizaci přes ARES</CardTitle>
              <CardDescription>Zadejte IČO pro automatické načtení firemních údajů.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="ico-search">IČO</Label>
                <div className="flex gap-2">
                  <Input
                    id="ico-search"
                    value={ico}
                    onChange={(e) => setIco(e.target.value)}
                    className="flex-1"
                    placeholder="Např. 27074358"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadFromAres();
                      }
                    }}
                  />
                  <Button onClick={loadFromAres} disabled={loading || !ico}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    {loading ? 'Načítám...' : 'Hledat'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Zadejte IČO a my automaticky načteme název, adresu a DIČ z registru ARES.
                </p>
              </div>

              {aresData && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-in fade-in-50 slide-in-from-top-5 duration-300 overflow-hidden">
                    <div className="bg-muted/50 p-4 border-b flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Nalezená data</h3>
                    </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <Building className="h-3 w-3" /> Název subjektu
                        </Label>
                        <div className="font-medium text-base">{aresData.name}</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <Hash className="h-3 w-3" /> IČO
                        </Label>
                        <div className="font-medium text-base font-mono">{aresData.ico}</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <Hash className="h-3 w-3" /> DIČ
                        </Label>
                        <div className="font-medium text-base font-mono">{aresData.dic || '-'}</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider">
                            <MapPin className="h-3 w-3" /> Adresa sídla
                        </Label>
                        <div className="font-medium text-base">{aresData.address}</div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                        onClick={() => createOrganization(aresData)}
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[200px]"
                        size="lg"
                        >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {loading ? 'Vytvářím...' : 'Vytvořit organizaci'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual">
            <Card>
                <CardHeader>
                    <CardTitle>Ruční zadání údajů</CardTitle>
                    <CardDescription>Vyplňte údaje o organizaci ručně.</CardDescription>
                </CardHeader>
                <form onSubmit={handleManualSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Název organizace *</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="Moje Firma s.r.o."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ico">IČO *</Label>
                                <Input 
                                    id="ico" 
                                    value={formData.ico} 
                                    onChange={e => setFormData({...formData, ico: e.target.value})}
                                    required
                                    placeholder="12345678"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dic">DIČ</Label>
                                <Input 
                                    id="dic" 
                                    value={formData.dic} 
                                    onChange={e => setFormData({...formData, dic: e.target.value})}
                                    placeholder="CZ12345678"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresa</Label>
                            <Input 
                                id="address" 
                                value={formData.address} 
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Ulice 123, 110 00 Město"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Vytvořit organizaci
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
