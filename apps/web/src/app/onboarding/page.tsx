'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check, ArrowRight, Building2, CreditCard, Image as ImageIcon, Search } from 'lucide-react';

export default function OnboardingPage() {
  const { currentOrg } = useOrganization();
  const { fetchWithAuth } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (currentOrg) {
          setData((prev: any) => ({ ...prev, organizationId: currentOrg.id }));
          // If org exists, maybe jump to step 2? For now, let's just assume we start from scratch or edit existing.
          setStep(2); 
      }
  }, [currentOrg]);

  const nextStep = () => setStep(step + 1);

  const loadFromAres = async () => {
      if (!data.ico) return;
      if (data.ico.length < 8) {
          toast.error("IČO musí mít alespoň 8 znaků");
          return;
      }
      setLoading(true);
      try {
          const res = await fetchWithAuth(`/api/organizations/ares/${data.ico}`);
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
          const aresData = await res.json();
          setData((prev: any) => ({ ...prev, name: aresData.name, ico: aresData.ico }));
          toast.success('Data z ARES načtena');
      } catch (err: any) {
          toast.error(err.message || 'Chyba při načítání z ARES');
      } finally {
          setLoading(false);
      }
  };

  const saveOrg = async () => {
      if (!data.name || !data.ico) {
          toast.error("Vyplňte prosím všechna pole.");
          return;
      }
      
      setLoading(true);
      try {
          // ARES fetch happens automatically in NewOrganizationPage, here we just save
          const res = await fetchWithAuth('/api/organizations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  name: data.name, 
                  ico: data.ico 
              })
          });
          
          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || 'Chyba při ukládání organizace');
          }
          
          const org = await res.json();
          setData({ ...data, organizationId: org.id });
          toast.success("Organizace uložena");
          nextStep();
      } catch (error: any) {
          toast.error(error.message || "Nepodařilo se uložit organizaci.");
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const saveBank = async () => {
      if (!data.accountNumber || !data.bankCode) {
          toast.error("Vyplňte prosím všechna pole.");
          return;
      }

      setLoading(true);
      try {
          const res = await fetchWithAuth(`/api/organizations/${data.organizationId}/bank-accounts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  accountNumber: data.accountNumber,
                  bankCode: data.bankCode
              })
          });

          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || 'Chyba při ukládání bankovního spojení');
          }

          toast.success("Bankovní spojení uloženo");
          nextStep();
      } catch (error: any) {
          toast.error(error.message || "Nepodařilo se uložit bankovní spojení.");
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const saveLogo = async () => {
      // Mock Upload
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          toast.success("Logo nahráno (mock)");
          nextStep();
      }, 1000);
  };

  const finish = () => {
      router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-8">
          <div className="flex justify-between items-center px-2">
              {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`flex items-center`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${
                          s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                          {s < step ? <Check className="h-5 w-5" /> : s}
                      </div>
                      {s < 4 && (
                          <div className={`h-1 w-12 mx-2 rounded transition-colors duration-300 ${
                              s < step ? 'bg-primary' : 'bg-muted'
                          }`} />
                      )}
                  </div>
              ))}
          </div>

          <Card className="shadow-xl border-t-4 border-t-primary">
              {step === 1 && (
                  <>
                      <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                              <Building2 className="h-6 w-6 text-primary" />
                              Vítejte ve Vulpi! 👋
                          </CardTitle>
                          <CardDescription>
                              Začněme přidáním vaší firmy. Zadejte IČO a my zbytek načteme z ARES.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="ico">IČO</Label>
                              <div className="flex gap-2">
                                <Input 
                                    id="ico" 
                                    placeholder="např. 12345678" 
                                    value={data.ico || ''}
                                    onChange={e => setData({...data, ico: e.target.value})}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        loadFromAres();
                                      }
                                    }}
                                />
                                <Button onClick={loadFromAres} disabled={loading || !data.ico} variant="outline">
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                  Klikněte na lupu pro načtení údajů z ARES.
                              </p>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="name">Název firmy</Label>
                              <Input 
                                  id="name" 
                                  placeholder="Moje Firma s.r.o." 
                                  value={data.name || ''}
                                  onChange={e => setData({...data, name: e.target.value})} 
                              />
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={saveOrg} className="w-full" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Pokračovat
                          </Button>
                      </CardFooter>
                  </>
              )}

              {step === 2 && (
                  <>
                      <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                              <CreditCard className="h-6 w-6 text-primary" />
                              Bankovní spojení 🏦
                          </CardTitle>
                          <CardDescription>
                              Kam vám mají klienti posílat peníze?
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="accountNumber">Číslo účtu</Label>
                              <Input 
                                  id="accountNumber" 
                                  placeholder="123456789/0100" 
                                  value={data.accountNumber || ''}
                                  onChange={e => setData({...data, accountNumber: e.target.value})} 
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="bankCode">Kód banky</Label>
                              <Input 
                                  id="bankCode" 
                                  placeholder="0800" 
                                  value={data.bankCode || ''}
                                  onChange={e => setData({...data, bankCode: e.target.value})} 
                              />
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={saveBank} className="w-full" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Uložit a Pokračovat
                          </Button>
                      </CardFooter>
                  </>
              )}

              {step === 3 && (
                  <>
                      <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                              <ImageIcon className="h-6 w-6 text-primary" />
                              Váš Brand 🎨
                          </CardTitle>
                          <CardDescription>
                              Nahrajte logo, aby vaše faktury vypadaly profesionálně.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div 
                              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors p-8 text-center rounded-lg cursor-pointer bg-muted/50 hover:bg-muted group"
                              onClick={saveLogo}
                          >
                              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                  <ImageIcon className="h-12 w-12 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                  <p className="font-medium">Klikněte pro nahrání loga</p>
                                  <p className="text-xs">PNG, JPG nebo SVG (max. 2MB)</p>
                              </div>
                          </div>
                      </CardContent>
                      <CardFooter className="flex gap-4">
                          <Button variant="ghost" onClick={nextStep} className="flex-1">
                              Přeskočit
                          </Button>
                          <Button onClick={saveLogo} className="flex-1" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Nahrát a Pokračovat
                          </Button>
                      </CardFooter>
                  </>
              )}

              {step === 4 && (
                  <>
                      <CardContent className="pt-6 text-center space-y-4">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">Hotovo! 🎉</h2>
                          <p className="text-muted-foreground">
                              Vše je nastaveno. Můžete začít fakturovat a spravovat své podnikání.
                          </p>
                      </CardContent>
                      <CardFooter>
                          <Button onClick={finish} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg" size="lg">
                              Přejít do Vulpi
                              <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                      </CardFooter>
                  </>
              )}
          </Card>
      </div>
    </div>
  );
}
