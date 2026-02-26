import { useState, useEffect } from 'react';
import { getBep } from '../api/get-bep';

export function useBep(organizationId: string | undefined) {
  const [bep, setBep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getBep(organizationId)
        .then(setBep)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [organizationId]);

  return { bep, loading };
}
