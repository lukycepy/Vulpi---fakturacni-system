export async function getCashflow(organizationId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/expenses/cashflow?organizationId=${organizationId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch cashflow data');
  }
  return res.json();
}
