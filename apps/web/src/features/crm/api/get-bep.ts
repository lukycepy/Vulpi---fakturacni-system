export async function getBep(organizationId: string) {
  const res = await fetch(`/api/crm/bep?organizationId=${organizationId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch BEP');
  }
  return res.json();
}
