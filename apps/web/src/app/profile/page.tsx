'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { startRegistration } from '@simplewebauthn/browser';
import { Key, Trash2, Plus, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProfilePage() {
  const { user, refreshUser, fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Password Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Passkeys State
  const [passkeys, setPasskeys] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
      fetchPasskeys();
    }
  }, [user]);

  const fetchPasskeys = async () => {
    try {
      const res = await fetchWithAuth('/api/auth/webauthn/credentials');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPasskeys(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const body: any = { name, avatarUrl };
      if (password) {
        if (password !== confirmPassword) {
          toast.error('Hesla se neshodují');
          setLoading(false);
          return;
        }
        body.password = password;
      }

      const res = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Aktualizace selhala');

      toast.success('Profil aktualizován');
      setPassword('');
      setConfirmPassword('');
      refreshUser();
    } catch (error) {
      toast.error('Chyba při aktualizaci profilu');
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async () => {
    try {
      const resp = await fetchWithAuth('/api/auth/webauthn/register/options', { method: 'POST' });
      const options = await resp.json();
      const attResp = await startRegistration(options);
      
      const verificationResp = await fetchWithAuth('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      if (verificationResp.ok) {
        toast.success('Passkey úspěšně přidán!');
        fetchPasskeys();
      } else {
        toast.error('Chyba při registraci Passkey.');
      }
    } catch (e: any) {
      toast.error('Chyba: ' + (e.message || e));
    }
  };

  const deletePasskey = async (id: string) => {
    try {
      await fetchWithAuth(`/api/auth/webauthn/credentials/${id}`, { method: 'DELETE' });
      setPasskeys(passkeys.filter(p => p.id !== id));
      toast.success('Klíč smazán.');
    } catch (e) {
      toast.error('Chyba při mazání.');
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Můj Profil</h1>
        <p className="text-muted-foreground mt-2">Spravujte své osobní údaje a nastavení účtu.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Osobní údaje</TabsTrigger>
          <TabsTrigger value="security">Bezpečnost</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
              <CardDescription>Aktualizujte své jméno a profilový obrázek.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Nahrát obrázek
                  </Label>
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">Podporované formáty: JPG, PNG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                  <p className="text-xs text-muted-foreground">Email nelze změnit. Kontaktujte podporu.</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Jméno a příjmení</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Změna hesla</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Nové heslo</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Ponechte prázdné, pokud nechcete měnit"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateProfile} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Uložit změny
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Passkeys (WebAuthn)
              </CardTitle>
              <CardDescription>
                Přihlašujte se bezpečně pomocí otisku prstu, FaceID nebo hardwarového klíče bez hesla.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passkeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Zatím nemáte žádné klíče</p>
                </div>
              ) : (
                passkeys.map((pk) => (
                  <div key={pk.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {pk.transports ? JSON.parse(JSON.stringify(pk.transports)).join(', ') : 'Zařízení'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Přidáno: {new Date(pk.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Smazat klíč?"
                      description="Opravdu chcete odebrat tento Passkey?"
                      onConfirm={() => deletePasskey(pk.id)}
                      variant="destructive"
                    />
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={registerPasskey} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Přidat Passkey
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
