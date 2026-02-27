'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Loader2, Shield, Key, Lock, Trash2, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SecurityPage() {
  const { currentOrg } = useOrganization();
  const [ips, setIps] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Passkeys State
  const [passkeys, setPasskeys] = useState<any[]>([]);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Fetch user 2FA status
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setTwoFactorEnabled(data.twoFactorEnabled);
      })
      .catch(() => toast.error('Nepodařilo se načíst stav 2FA.'));

    // Fetch passkeys
    fetch('/api/auth/webauthn/credentials')
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setPasskeys(data);
      })
      .catch(() => toast.error('Nepodařilo se načíst passkeys.'));
  }, []);

  const registerPasskey = async () => {
    try {
        const resp = await fetch('/api/auth/webauthn/register/options', {
            method: 'POST',
        });
        const options = await resp.json();

        const attResp = await startRegistration(options);

        const verificationResp = await fetch('/api/auth/webauthn/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attResp),
        });

        if (verificationResp.ok) {
            toast.success('Passkey úspěšně přidán!');
            // Refresh list
            const list = await fetch('/api/auth/webauthn/credentials').then(r => r.json());
            if (Array.isArray(list)) setPasskeys(list);
        } else {
            toast.error('Chyba při registraci Passkey.');
        }
    } catch (e: any) {
        toast.error('Chyba: ' + (e.message || e));
    }
  };

  const deletePasskey = async (id: string) => {
    try {
        await fetch(`/api/auth/webauthn/credentials/${id}`, { method: 'DELETE' });
        setPasskeys(passkeys.filter(p => p.id !== id));
        toast.success('Klíč smazán.');
    } catch (e) {
        toast.error('Chyba při mazání.');
    }
  };

  const generate2FA = async () => {
    try {
      const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
      const data = await res.json();
      setSecret(data.secret);
      // Use the generated data URL from backend
      setQrCode(data.qrCodeDataUrl);
      setShowSetup(true);
    } catch (e) {
      toast.error('Chyba při generování 2FA.');
    }
  };

  const enable2FA = async () => {
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });
      
      if (!res.ok) throw new Error();

      setTwoFactorEnabled(true);
      setShowSetup(false);
      toast.success('2FA úspěšně zapnuto.');
    } catch (e) {
      toast.error('Neplatný kód.');
    }
  };

  const disable2FA = async () => {
    try {
      await fetch('/api/auth/2fa/disable', { method: 'POST' });
      setTwoFactorEnabled(false);
      toast.success('2FA vypnuto.');
    } catch (e) {
      toast.error('Chyba při vypínání 2FA.');
    }
  };

  useEffect(() => {
    if (currentOrg && currentOrg.allowedIps) {
        setIps(currentOrg.allowedIps.join('\n'));
    }
  }, [currentOrg]);

  const saveIps = async () => {
      setLoading(true);
      const ipList = ips.split('\n').map(ip => ip.trim()).filter(ip => ip);
      
      try {
          await fetch('/api/security/ips', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  organizationId: currentOrg?.id,
                  ips: ipList
              })
          });
          toast.success('Bezpečnostní pravidla uložena.');
      } catch (e) {
          toast.error('Chyba při ukládání.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zabezpečení</h1>
        <p className="text-muted-foreground mt-2">Správa bezpečnosti vašeho účtu a organizace.</p>
      </div>

      {/* 2FA Section */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Dvoufázové ověření (2FA)
            </CardTitle>
            <CardDescription>
                Zvyšte bezpečnost svého účtu pomocí 2FA. Při přihlášení budete vyzváni k zadání kódu z aplikace Google Authenticator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {twoFactorEnabled ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-600">Aktivní</span>
                    </div>
                    
                    <ConfirmDialog
                        trigger={
                            <Button variant="destructive" size="sm">
                                Vypnout 2FA
                            </Button>
                        }
                        title="Vypnout 2FA?"
                        description="Váš účet bude méně zabezpečený. Opravdu chcete pokračovat?"
                        actionLabel="Vypnout"
                        onConfirm={disable2FA}
                        variant="destructive"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {!showSetup ? (
                        <Button onClick={generate2FA}>
                            Nastavit 2FA
                        </Button>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div className="flex flex-col items-center p-6 bg-white rounded-lg border shadow-sm">
                                <p className="mb-4 text-sm font-medium">1. Naskenujte QR kód</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                <p className="mt-4 text-xs text-muted-foreground break-all font-mono bg-muted p-2 rounded">
                                    {secret}
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>2. Zadejte ověřovací kód</Label>
                                    <Input 
                                        type="text" 
                                        placeholder="000 000" 
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                        className="text-lg tracking-widest font-mono"
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Opište 6-místný kód z vaší aplikace.
                                    </p>
                                </div>
                                <Button onClick={enable2FA} className="w-full">
                                    Ověřit a zapnout
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </CardContent>
      </Card>

      {/* Passkeys Section */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Passkeys (FIDO2 / WebAuthn)
            </CardTitle>
            <CardDescription>
                Přihlaste se bezpečně pomocí otisku prstu, FaceID nebo hardwarového klíče (Yubikey).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {passkeys.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Zatím nemáte žádné klíče</p>
                  </div>
              )}

              {passkeys.map((pk) => (
                  <div key={pk.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                          <p className="font-medium flex items-center gap-2">
                              {pk.transports ? pk.transports.join(', ') : 'Neznámé zařízení'}
                              {pk.aaguid && <Badge variant="outline" className="text-xs font-mono">{pk.aaguid.substring(0, 8)}...</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                              Přidáno: {new Date(pk.createdAt).toLocaleDateString()}
                          </p>
                      </div>
                      
                      <ConfirmDialog
                          trigger={
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          }
                          title="Smazat klíč?"
                          description="Opravdu chcete odebrat tento Passkey? Pokud jej smažete, nebudete se s ním moci přihlásit."
                          actionLabel="Smazat"
                          onConfirm={() => deletePasskey(pk.id)}
                          variant="destructive"
                      />
                  </div>
              ))}
          </CardContent>
          <CardFooter>
              <Button onClick={registerPasskey} variant="outline" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Přidat nový Passkey
              </Button>
          </CardFooter>
      </Card>

      {/* IP Whitelist Section */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                IP Whitelist (IP Zámek)
            </CardTitle>
            <CardDescription>
                Zadejte IP adresy, ze kterých je povolen přístup k této organizaci. Pokud necháte prázdné, přístup je povolen odkudkoliv.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="ips">Povolené IP adresy (jedna na řádek)</Label>
                <Textarea 
                    id="ips"
                    value={ips}
                    onChange={e => setIps(e.target.value)}
                    className="min-h-[150px] font-mono"
                    placeholder="192.168.1.1&#10;8.8.8.8"
                />
             </div>
          </CardContent>
          <CardFooter>
              <Button 
                  onClick={saveIps}
                  disabled={loading}
                  variant="destructive"
              >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Ukládám...' : 'Uložit bezpečnostní pravidla'}
              </Button>
          </CardFooter>
      </Card>

      <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Vault (Šifrované klíče)
            </CardTitle>
            <CardDescription>
                API klíče k bankám a certifikáty jsou bezpečně šifrovány (AES-256).
                Tato sekce je spravována automaticky při integraci.
            </CardDescription>
          </CardHeader>
      </Card>
    </div>
  );
}
