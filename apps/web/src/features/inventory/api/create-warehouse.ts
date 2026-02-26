export async function createWarehouse(data: any) {
  const res = await fetch('/api/inventory/warehouses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create warehouse');
  return res.json();
}
