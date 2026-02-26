export async function getCashflow(organizationId: string) {
  const res = await fetch(`/api/expenses/cashflow?organizationId=${organizationId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch cashflow data');
  }
  return res.json();
}
