'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token || !email) {
    return (
      <Card className="w-full max-w-md shadow-lg border-destructive/50">
          <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Neplatný odkaz
              </CardTitle>
              <CardDescription>
                  Odkaz pro obnovu hesla je neplatný nebo expiroval.
              </CardDescription>
          </CardHeader>
          <CardFooter>
              <Button onClick={() => router.push('/auth/login')} variant="outline" className="w-full">
                  Zpět na přihlášení
              </Button>
          </CardFooter>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 12) {
      toast.error('Heslo musí mít alespoň 12 znaků');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Chyba při obnově hesla');
      }

      toast.success(data.message || 'Heslo bylo úspěšně změněno.');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="h-6 w-6 text-primary" />
            </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Nastavení nového hesla</CardTitle>
        <CardDescription className="text-center">
            Zadejte nové silné heslo pro váš účet.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nové heslo</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimálně 12 znaků"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Ukládání...' : 'Uložit nové heslo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
       <Suspense fallback={<div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Načítání...</div>}>
         <ResetPasswordForm />
       </Suspense>
    </div>
  );
}
