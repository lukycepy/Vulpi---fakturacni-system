export async function sendInvoice(id: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/invoices/${id}/send`, { method: 'POST' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send invoice');
  }
  return res.json();
}
