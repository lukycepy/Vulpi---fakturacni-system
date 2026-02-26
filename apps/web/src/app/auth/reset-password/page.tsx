'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token || !email) {
    return (
      <div className="text-center text-red-600">
        Neplatný odkaz pro obnovu hesla.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword.length < 12) {
      setError('Heslo musí mít alespoň 12 znaků');
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

      setMessage(data.message);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Nastavení nového hesla
        </h2>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded text-sm text-center">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded text-sm text-center">
          {message}
          <p className="mt-2 text-xs">Budete přesměrováni na přihlášení...</p>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="new-password" className="sr-only">Nové heslo</label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              placeholder="Nové heslo (min. 12 znaků)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? 'Ukládání...' : 'Uložit nové heslo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
       <Suspense fallback={<div>Načítání...</div>}>
         <ResetPasswordForm />
       </Suspense>
    </div>
  );
}
