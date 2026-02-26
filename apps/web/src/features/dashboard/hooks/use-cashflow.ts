import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getCashflow } from '../api/get-cashflow';

export function useCashflow(organizationId: string | undefined) {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getCashflow(organizationId, fetchWithAuth)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [organizationId, fetchWithAuth]);

  return { data, loading, error };
}
