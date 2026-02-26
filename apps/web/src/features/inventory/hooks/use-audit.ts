import { useState } from 'react';
import { startAudit } from '../api/start-audit';
import { submitAuditItem } from '../api/submit-audit-item';
import { closeAudit } from '../api/close-audit';

export function useAudit() {
  const [auditId, setAuditId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const start = async (warehouse: any) => {
    const audit = await startAudit(warehouse.id);
    setAuditId(audit.id);
    setItems(warehouse.stocks.map((s: any) => ({
      productId: s.productId,
      name: s.product.name,
      expectedQty: s.quantity,
      actualQty: s.quantity
    })));
  };

  const submit = async () => {
    if (!auditId) return;
    for (const item of items) {
      await submitAuditItem(auditId, {
        productId: item.productId,
        actualQty: Number(item.actualQty)
      });
    }
    await closeAudit(auditId);
    setAuditId(null);
    setItems([]);
  };

  return { auditId, items, setItems, start, submit };
}
