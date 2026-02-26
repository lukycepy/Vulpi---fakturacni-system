export async function getPipeline(organizationId: string) {
  const res = await fetch(`/api/crm/pipeline?organizationId=${organizationId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch pipeline');
  }
  return res.json();
}
