'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { startAuthentication } from '@simplewebauthn/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [require2fa, setRequire2fa] = useState(false);
  const [token2fa, setToken2fa] = useState('');
  const [userId, setUserId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    setError('');
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
            router.push('/dashboard');
        } else {
            throw new Error(verificationJSON.message || 'Ověření Passkey selhalo');
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handle2faLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {require2fa ? 'Ověření 2FA' : 'Přihlášení do účtu'}
          </h2>
          {!require2fa && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Vítejte zpět ve Vulpi
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        {require2fa ? (
          <form className="mt-8 space-y-6" onSubmit={handle2faLogin}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ověřovací kód (TOTP)
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="123456"
                value={token2fa}
                onChange={(e) => setToken2fa(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? 'Ověřování...' : 'Ověřit'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">Email nebo uživatelské jméno</label>
                <input
                  id="email-address"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  placeholder="Email nebo uživatelské jméno"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Heslo</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  placeholder="Heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Zapomněli jste heslo?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se'}
              </button>
            </div>
          </form>
        )}

        {!require2fa && (
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Nebo pokračovat přes</span>
                    </div>
                </div>

                <div className="mt-6">
                    <a href="http://localhost:4000/api/auth/google" className="flex w-full items-center justify-center gap-3 rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:ring-transparent">
                         <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24"><path d="M12.0003 20.45c4.65 0 8.05-3.15 8.05-8.05 0-.7-.05-1.35-.15-1.95h-7.9v3.7h4.5c-.2 1.25-1.15 2.35-2.55 3.25l-.1.05 3.05 2.35.2.05c2-1.85 3.15-4.55 3.15-7.65 0-1.1-.2-2.15-.55-3.1H12.0003v-4.7h-4.7v4.7h-4.7v-4.7h-4.7v4.7H1.9003v4.7h4.7v4.7h-4.7v-4.7h-4.7v4.7h4.7v4.7h4.7v-4.7h4.7v4.7h4.7z" fill="currentColor" fillOpacity="0" /><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        <span className="text-sm font-semibold leading-6">Google</span>
                    </a>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleWebAuthnLogin}
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 001.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 011.872 1.002l.164.246a2.25 2.25 0 001.872 1.002h2.092a2.25 2.25 0 001.872-1.002l.164-.246A2.25 2.25 0 0116.954 9h4.636M2.41 9a2.25 2.25 0 00-.16.832V12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 01.382-.632l3.285-3.832a2.25 2.25 0 011.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M7 20.25h10" />
                        </svg>
                        Přihlásit se otiskem prstu / klíčem
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

