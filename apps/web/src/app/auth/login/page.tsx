'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Fingerprint } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [require2fa, setRequire2fa] = useState(false);
  const [token2fa, setToken2fa] = useState('');
  const [userId, setUserId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Přihlášení se nezdařilo');
      }

      if (data.require2fa) {
        setRequire2fa(true);
        setUserId(data.userId);
        setLoading(false);
        return;
      }

      // Success
      toast.success("Přihlášení úspěšné");
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    setLoading(true);

    try {
        if (!email) {
            throw new Error('Zadejte prosím email nebo uživatelské jméno pro zahájení Passkey přihlášení.');
        }

        // 1. Get options from server
        const resp = await fetch('/api/auth/webauthn/login/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!resp.ok) {
             const d = await resp.json();
             throw new Error(d.message || 'Chyba při inicializaci Passkey');
        }

        const options = await resp.json();

        // 2. Pass options to browser
        const asseResp = await startAuthentication(options);

        // 3. Verify response
        const verificationResp = await fetch('/api/auth/webauthn/login/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(asseResp),
        });

        const verificationJSON = await verificationResp.json();

        if (verificationJSON && verificationResp.ok) {
            toast.success("Přihlášení pomocí Passkey úspěšné");
            router.push('/dashboard');
        } else {
            throw new Error(verificationJSON.message || 'Ověření Passkey selhalo');
        }
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handle2faLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: token2fa }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Ověření 2FA se nezdařilo');
      }

      // Success
      toast.success("Ověření úspěšné");
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {require2fa ? 'Ověření 2FA' : 'Přihlášení do účtu'}
          </CardTitle>
          {!require2fa && (
            <CardDescription className="text-center">
              Vítejte zpět ve Vulpi
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
        {require2fa ? (
          <form className="space-y-4" onSubmit={handle2faLogin}>
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ověřovací kód (TOTP)
              </label>
              <Input
                id="token"
                name="token"
                type="text"
                required
                placeholder="123456"
                value={token2fa}
                onChange={(e) => setToken2fa(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Ověřování...' : 'Ověřit'}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email nebo uživatelské jméno</label>
                <Input
                  id="email-address"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Email nebo uživatelské jméno"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Heslo</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
                  Zapomněli jste heslo?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </Button>
          </form>
        )}

        {!require2fa && (
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Nebo pokračovat přes
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    <a href="http://localhost:4000/api/auth/google" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                         <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24"><path d="M12.0003 20.45c4.65 0 8.05-3.15 8.05-8.05 0-.7-.05-1.35-.15-1.95h-7.9v3.7h4.5c-.2 1.25-1.15 2.35-2.55 3.25l-.1.05 3.05 2.35.2.05c2-1.85 3.15-4.55 3.15-7.65 0-1.1-.2-2.15-.55-3.1H12.0003v-4.7h-4.7v4.7h-4.7v-4.7h-4.7v4.7H1.9003v4.7h4.7v4.7h-4.7v-4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7v4.7h4.7z" fill="currentColor" fillOpacity="0" /><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </a>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleWebAuthnLogin}
                        disabled={loading}
                        className="w-full"
                    >
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Přihlásit se otiskem prstu / klíčem
                    </Button>
                </div>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

