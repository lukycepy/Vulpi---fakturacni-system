export async function getInvoices(
  params: { organizationId: string; type?: string; status?: string },
  fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch
) {
  const query = new URLSearchParams(JSON.parse(JSON.stringify(params))).toString();
  const res = await fetcher(`/api/invoices?${query}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch invoices');
  }
  return res.json();
}
