'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'SUPERADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'USER' | 'CLIENT';

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit, options?: { skipLogout?: boolean }) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Always clear local state and redirect
      setUser(null);
      router.push('/auth/login');
      router.refresh();
    }
  };

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit, options?: { skipLogout?: boolean }): Promise<Response> => {
    let response = await fetch(input, init);

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
        if (refreshRes.ok) {
          // Retry original request
          response = await fetch(input, init);
        } else {
          // Refresh failed
          if (!options?.skipLogout) {
            await logout();
            throw new Error('Session expired');
          }
        }
      } catch (error) {
        if (!options?.skipLogout) {
            await logout();
            throw error;
        }
      }
    }

    return response;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth('/api/auth/me', undefined, { skipLogout: true });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
