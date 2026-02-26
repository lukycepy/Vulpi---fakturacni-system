import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getInvoices } from '../api/get-invoices';

export function useInvoices(organizationId: string | undefined, filters?: { type?: string; status?: string }) {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = () => {
    if (organizationId) {
      setLoading(true);
      getInvoices({ organizationId, ...filters }, fetchWithAuth)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetch();
  }, [organizationId, JSON.stringify(filters), fetchWithAuth]);

  return { data, loading, error, refresh: fetch };
}
