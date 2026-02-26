export async function submitAuditItem(auditId: string, data: { productId: string; actualQty: number }, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/inventory/audits/${auditId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to submit audit item');
  }
  return res.json();
}
