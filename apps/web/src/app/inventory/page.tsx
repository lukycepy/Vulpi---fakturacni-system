'use client';

import { useState } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useWarehouses } from '@/features/inventory/hooks/use-warehouses';
import { useAudit } from '@/features/inventory/hooks/use-audit';
import { WarehouseList } from '@/features/inventory/components/warehouse-list';
import { AuditView } from '@/features/inventory/components/audit-view';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { currentOrg } = useOrganization();
  const { warehouses, create: createWh, refresh } = useWarehouses(currentOrg?.id);
  const { auditId, items: auditItems, setItems: setAuditItems, start, submit } = useAudit();
  const [view, setView] = useState<'overview' | 'audit'>('overview');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const openCreateModal = () => {
      setNewWarehouseName('');
      setIsCreateModalOpen(true);
  };

  const handleCreateWarehouse = async () => {
      if (!newWarehouseName) return;
      setIsCreating(true);
      try {
          await createWh(newWarehouseName);
          await refresh();
          toast.success('Sklad úspěšně vytvořen');
          setIsCreateModalOpen(false);
      } catch (error) {
          toast.error('Chyba při vytváření skladu');
      } finally {
          setIsCreating(false);
      }
  };

  const startAudit = async (warehouseId: string) => {
      const warehouse = warehouses.find(w => w.id === warehouseId);
      if (!warehouse) return;
      
      await start(warehouse);
      setView('audit');
  };

  const handleSubmitAudit = async () => {
      try {
        await submit();
        toast.success('Inventura dokončena. Sklad byl aktualizován.');
        setView('overview');
        refresh();
      } catch (error) {
        toast.error('Chyba při ukládání inventury');
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Skladové hospodářství</h1>

      {view === 'overview' && (
          <WarehouseList 
              warehouses={warehouses} 
              createWarehouse={openCreateModal} 
              startAudit={startAudit} 
          />
      )}

      {view === 'audit' && (
          <AuditView 
              auditItems={auditItems} 
              setAuditItems={setAuditItems} 
              setView={setView} 
              handleSubmitAudit={handleSubmitAudit} 
          />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nový sklad"
        description="Zadejte název nového skladu pro evidenci zásob."
        footer={
            <>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Zrušit
                </Button>
                <Button onClick={handleCreateWarehouse} disabled={!newWarehouseName || isCreating}>
                    {isCreating ? 'Vytvářím...' : 'Vytvořit sklad'}
                </Button>
            </>
        }
      >
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                    Název
                </label>
                <Input
                    id="name"
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                    className="col-span-3"
                    autoFocus
                    placeholder="Např. Hlavní sklad"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateWarehouse();
                    }}
                />
            </div>
        </div>
      </Modal>
    </div>
  );
}
