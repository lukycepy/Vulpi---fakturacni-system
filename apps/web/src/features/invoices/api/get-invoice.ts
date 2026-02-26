export async function getInvoice(id: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/invoices/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch invoice');
  }
  return res.json();
}
