export async function getWarehouses(organizationId: string) {
  const res = await fetch(`/api/inventory/warehouses?organizationId=${organizationId}`);
  if (!res.ok) throw new Error('Failed to fetch warehouses');
  return res.json();
}
