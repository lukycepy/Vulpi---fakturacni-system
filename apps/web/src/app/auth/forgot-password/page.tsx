'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Chyba při odesílání požadavku');
      }

      setSuccess(true);
      toast.success(data.message || 'Instrukce byly odeslány na váš email.');
    } catch (err: any) {
      toast.error(err.message || 'Neočekávaná chyba');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/30">
                <KeyRound className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-green-700 dark:text-green-400">Zkontrolujte svůj email</CardTitle>
            <CardDescription className="text-center text-green-600/80 dark:text-green-400/80">
              Odeslali jsme instrukce pro obnovu hesla na adresu <strong>{email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-center text-muted-foreground">
                Pokud email nedorazil do 5 minut, zkontrolujte složku SPAM.
             </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zpět na přihlášení
                </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Zapomenuté heslo</CardTitle>
          <CardDescription className="text-center">
            Zadejte svůj email a my vám zašleme instrukce pro obnovu hesla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Emailová adresa</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Odesílání...' : 'Odeslat instrukce'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login" className="text-sm font-medium text-primary hover:underline flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přihlášení
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
