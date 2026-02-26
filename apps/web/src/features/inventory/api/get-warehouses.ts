export async function getWarehouses(organizationId: string, fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch) {
  const res = await fetcher(`/api/inventory/warehouses?organizationId=${organizationId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch warehouses');
  }
  return res.json();
}
