import { useState, useEffect } from 'react';
import { getCashflow } from '../api/get-cashflow';

export function useCashflow(organizationId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getCashflow(organizationId)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [organizationId]);

  return { data, loading, error };
}
