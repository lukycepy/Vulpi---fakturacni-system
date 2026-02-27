'use client';

import { useState } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { usePipeline } from '@/features/crm/hooks/use-pipeline';
import { useBep } from '@/features/crm/hooks/use-bep';
import { useDealActions } from '@/features/crm/hooks/use-deal-actions';
import { BepWidget } from '@/features/crm/components/bep-widget';
import { KanbanBoard } from '@/features/crm/components/kanban-board';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function CrmPage() {
  const { currentOrg } = useOrganization();
  const { stages, setStages, refresh } = usePipeline(currentOrg?.id);
  const { bep } = useBep(currentOrg?.id);
  const { updateStage, create, updating } = useDealActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState(10000);

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

  const handleCreateDeal = async () => {
      if (!newDealTitle) return;
      
      await create({
          organizationId: currentOrg?.id,
          title: newDealTitle,
          value: newDealValue,
          stageId: stages[0].id
      });
      refresh();
      setIsModalOpen(false);
      setNewDealTitle('');
      setNewDealValue(10000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Obchodní nástěnka (CRM)</h1>

      <BepWidget bep={bep} />
      <KanbanBoard 
          stages={stages} 
          onDragStart={onDragStart} 
          onDrop={onDrop} 
          createNewDeal={() => setIsModalOpen(true)} 
          onDeleteDeal={handleDeleteDeal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nový obchod"
        description="Vytvořte novou obchodní příležitost."
        footer={
            <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Zrušit</Button>
                <Button onClick={handleCreateDeal} disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {updating ? 'Ukládám...' : 'Vytvořit obchod'}
                </Button>
            </>
        }
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Název obchodu</label>
                <Input 
                    value={newDealTitle} 
                    onChange={e => setNewDealTitle(e.target.value)} 
                    placeholder="Např. Implementace systému" 
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Hodnota (Kč)</label>
                <Input 
                    type="number" 
                    value={newDealValue} 
                    onChange={e => setNewDealValue(Number(e.target.value))} 
                />
            </div>
        </div>
      </Modal>
    </div>
  );
}
