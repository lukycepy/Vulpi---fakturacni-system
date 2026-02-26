export async function closeAudit(auditId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/inventory/audits/${auditId}/close`, { method: 'PATCH' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to close audit');
  }
  return res.json();
}
