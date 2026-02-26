import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { startAudit } from '../api/start-audit';
import { submitAuditItem } from '../api/submit-audit-item';
import { closeAudit } from '../api/close-audit';
import { toast } from 'sonner';

export function useAudit() {
  const { fetchWithAuth } = useAuth();
  const [auditId, setAuditId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const start = async (warehouse: any) => {
    try {
      const audit = await startAudit(warehouse.id, fetchWithAuth);
      setAuditId(audit.id);
      setItems(warehouse.stocks.map((s: any) => ({
        productId: s.productId,
        name: s.product.name,
        expectedQty: s.quantity,
        actualQty: s.quantity
      })));
      toast.success('Inventura zahájena');
    } catch (err: any) {
      toast.error('Chyba při zahájení inventury: ' + (err.message || 'Neznámá chyba'));
      console.error(err);
    }
  };

  const submit = async () => {
    if (!auditId) return;
    try {
      for (const item of items) {
        await submitAuditItem(auditId, {
          productId: item.productId,
          actualQty: Number(item.actualQty)
        }, fetchWithAuth);
      }
      await closeAudit(auditId, fetchWithAuth);
      setAuditId(null);
      setItems([]);
      toast.success('Inventura úspěšně dokončena');
    } catch (err: any) {
      toast.error('Chyba při dokončování inventury: ' + (err.message || 'Neznámá chyba'));
      console.error(err);
    }
  };

  return { auditId, items, setItems, start, submit };
}
