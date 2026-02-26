import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { createInvoice } from '../api/create-invoice';
import { toast } from 'sonner';

export function useCreateInvoice() {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInvoice(data, fetchWithAuth);
      toast.success('Faktura byla úspěšně vytvořena');
      return result;
    } catch (err: any) {
      setError(err);
      toast.error('Chyba při vytváření faktury: ' + (err.message || 'Neznámá chyba'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
