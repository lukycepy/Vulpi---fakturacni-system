export async function sendInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send invoice');
  }
  return res.json();
}
