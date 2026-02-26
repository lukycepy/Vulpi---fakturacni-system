
'use client';

import { useState } from 'react';
import { useOrganization } from '@/components/providers/organization-provider';
import { useWarehouses } from '@/features/inventory/hooks/use-warehouses';
import { useAudit } from '@/features/inventory/hooks/use-audit';
import { WarehouseList } from '@/features/inventory/components/warehouse-list';
import { AuditView } from '@/features/inventory/components/audit-view';

export default function InventoryPage() {
  const { currentOrg } = useOrganization();
  const { warehouses, create: createWh, refresh } = useWarehouses(currentOrg?.id);
  const { auditId, items: auditItems, setItems: setAuditItems, start, submit } = useAudit();
  const [view, setView] = useState<'overview' | 'audit'>('overview');

  const createWarehouse = async () => {
      const name = prompt('Název skladu:');
      if (!name) return;
      await createWh(name);
      refresh();
  };

  const startAudit = async (warehouseId: string) => {
      const warehouse = warehouses.find(w => w.id === warehouseId);
      if (!warehouse) return;
      
      await start(warehouse);
      setView('audit');
  };

  const handleSubmitAudit = async () => {
      await submit();
      alert('Inventura dokončena. Sklad byl aktualizován.');
      setView('overview');
      refresh();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Skladové hospodářství</h1>

      {view === 'overview' && (
          <WarehouseList 
              warehouses={warehouses} 
              createWarehouse={createWarehouse} 
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
    </div>
  );
}
