import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { sendInvoice } from '../api/send-invoice';
import { toast } from 'sonner';

export function useSendInvoice() {
  const { fetchWithAuth } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = async (id: string) => {
    setSending(true);
    setError(null);
    try {
      await sendInvoice(id, fetchWithAuth);
      toast.success('Faktura byla úspěšně odeslána');
    } catch (err: any) {
      setError(err);
      toast.error('Chyba při odesílání faktury: ' + (err.message || 'Neznámá chyba'));
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { send, sending, error };
}
