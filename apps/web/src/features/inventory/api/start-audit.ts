export async function startAudit(warehouseId: string) {
  const res = await fetch('/api/inventory/audits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ warehouseId }),
  });
  if (!res.ok) throw new Error('Failed to start audit');
  return res.json();
}
