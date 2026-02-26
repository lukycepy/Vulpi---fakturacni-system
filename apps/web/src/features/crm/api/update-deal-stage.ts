export async function updateDealStage(dealId: string, stageId: string) {
  const res = await fetch(`/api/crm/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stageId }),
  });
  if (!res.ok) {
    throw new Error('Failed to update deal stage');
  }
  return res.json();
}
