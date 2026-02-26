
'use client';

import { useOrganization } from '@/components/providers/organization-provider';
import { usePipeline } from '@/features/crm/hooks/use-pipeline';
import { useBep } from '@/features/crm/hooks/use-bep';
import { useDealActions } from '@/features/crm/hooks/use-deal-actions';
import { BepWidget } from '@/features/crm/components/bep-widget';
import { KanbanBoard } from '@/features/crm/components/kanban-board';

export default function CrmPage() {
  const { currentOrg } = useOrganization();
  const { stages, setStages, refresh } = usePipeline(currentOrg?.id);
  const { bep } = useBep(currentOrg?.id);
  const { updateStage, create } = useDealActions();

  const onDragStart = (e: any, dealId: string) => {
      e.dataTransfer.setData('dealId', dealId);
  };

  const onDrop = async (e: any, stageId: string) => {
      const dealId = e.dataTransfer.getData('dealId');
      if (!dealId) return;

      // Optimistic Update
      const newStages = [...stages];
      let deal: any;
      newStages.forEach(s => {
          const idx = s.deals.findIndex((d: any) => d.id === dealId);
          if (idx > -1) {
              deal = s.deals[idx];
              s.deals.splice(idx, 1);
          }
      });
      const targetStage = newStages.find(s => s.id === stageId);
      if (targetStage && deal) targetStage.deals.push(deal);
      setStages(newStages);

      // API Call
      await updateStage(dealId, stageId);
  };

  const createNewDeal = async () => {
      const title = prompt('Název obchodu:');
      if (!title) return;
      
      await create({
          organizationId: currentOrg?.id,
          title,
          value: 10000,
          stageId: stages[0].id
      });
      refresh();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Obchodní nástěnka (CRM)</h1>

      <BepWidget bep={bep} />
      <KanbanBoard 
          stages={stages} 
          onDragStart={onDragStart} 
          onDrop={onDrop} 
          createNewDeal={createNewDeal} 
      />
    </div>
  );
}
