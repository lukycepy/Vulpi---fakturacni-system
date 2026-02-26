import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getInvoice } from '../api/get-invoice';

export function useInvoice(id: string | undefined) {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getInvoice(id, fetchWithAuth)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [id, fetchWithAuth]);

  return { data, loading, error, mutate: setData };
}
