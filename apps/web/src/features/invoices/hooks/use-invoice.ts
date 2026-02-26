import { useState, useEffect } from 'react';
import { getInvoice } from '../api/get-invoice';

export function useInvoice(id: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getInvoice(id)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [id]);

  return { data, loading, error, mutate: setData };
}
