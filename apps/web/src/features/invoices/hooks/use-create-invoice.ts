import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { createInvoice } from '../api/create-invoice';

export function useCreateInvoice() {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInvoice(data, fetchWithAuth);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
