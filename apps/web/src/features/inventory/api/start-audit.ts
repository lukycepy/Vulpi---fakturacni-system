export async function startAudit(warehouseId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher('/api/inventory/audits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ warehouseId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to start audit');
  }
  return res.json();
}
