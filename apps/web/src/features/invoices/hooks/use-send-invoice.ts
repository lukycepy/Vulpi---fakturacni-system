import { useState } from 'react';
import { sendInvoice } from '../api/send-invoice';

export function useSendInvoice() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = async (id: string) => {
    setSending(true);
    setError(null);
    try {
      await sendInvoice(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { send, sending, error };
}
