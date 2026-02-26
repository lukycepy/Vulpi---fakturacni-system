import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { toast } from 'sonner';

export function useDeleteInvoice() {
  const { fetchWithAuth } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const deleteInvoice = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete invoice');
      }

      toast.success('Faktura byla úspěšně smazána');
      return true;
    } catch (err: any) {
      toast.error('Chyba při mazání faktury: ' + (err.message || 'Neznámá chyba'));
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteInvoice, deleting };
}
