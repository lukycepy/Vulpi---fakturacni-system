export async function getInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch invoice');
  }
  return res.json();
}
