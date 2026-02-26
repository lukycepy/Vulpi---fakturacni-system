import { useState, useEffect } from 'react';
import { getWarehouses } from '../api/get-warehouses';
import { createWarehouse } from '../api/create-warehouse';

export function useWarehouses(organizationId: string | undefined) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    if (organizationId) {
      setLoading(true);
      getWarehouses(organizationId)
        .then(setWarehouses)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    refresh();
  }, [organizationId]);

  const create = async (name: string) => {
    if (!organizationId) return;
    await createWarehouse({ organizationId, name });
    refresh();
  };

  return { warehouses, loading, create, refresh };
}
