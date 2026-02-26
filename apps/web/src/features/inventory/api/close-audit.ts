export async function closeAudit(auditId: string) {
  const res = await fetch(`/api/inventory/audits/${auditId}/close`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to close audit');
  return res.json();
}
