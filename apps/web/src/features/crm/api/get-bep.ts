export async function getBep(organizationId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/crm/bep?organizationId=${organizationId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch BEP');
  }
  return res.json();
}
