export async function createInvoice(data: any, fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>) {
  const res = await fetchWithAuth('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create invoice');
  }
  
  return res.json();
}
