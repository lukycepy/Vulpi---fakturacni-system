export async function createDeal(data: any) {
  const res = await fetch('/api/crm/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create deal');
  }
  return res.json();
}
