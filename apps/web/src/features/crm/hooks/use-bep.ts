import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getBep } from '../api/get-bep';

export function useBep(organizationId: string | undefined) {
  const { fetchWithAuth } = useAuth();
  const [bep, setBep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getBep(organizationId, fetchWithAuth)
        .then(setBep)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [organizationId, fetchWithAuth]);

  return { bep, loading };
}
