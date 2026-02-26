export async function createDeal(data: any, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher('/api/crm/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create deal');
  }
  return res.json();
}
