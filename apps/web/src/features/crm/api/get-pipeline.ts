export async function getPipeline(organizationId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/crm/pipeline?organizationId=${organizationId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch pipeline');
  }
  return res.json();
}
