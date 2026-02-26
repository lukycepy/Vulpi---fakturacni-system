export async function submitAuditItem(auditId: string, data: { productId: string; actualQty: number }) {
  const res = await fetch(`/api/inventory/audits/${auditId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit audit item');
  return res.json();
}
