import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getWarehouses } from '../api/get-warehouses';
import { createWarehouse } from '../api/create-warehouse';
import { toast } from 'sonner';

export function useWarehouses(organizationId: string | undefined) {
  const { fetchWithAuth } = useAuth();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    if (organizationId) {
      setLoading(true);
      getWarehouses(organizationId, fetchWithAuth)
        .then(setWarehouses)
        .catch(err => {
          console.error(err);
          toast.error('Chyba při načítání skladů: ' + (err.message || 'Neznámá chyba'));
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    refresh();
  }, [organizationId, fetchWithAuth]);

  const create = async (name: string) => {
    if (!organizationId) return;
    try {
      await createWarehouse({ organizationId, name }, fetchWithAuth);
      toast.success('Sklad byl úspěšně vytvořen');
      refresh();
    } catch (err: any) {
      toast.error('Chyba při vytváření skladu: ' + (err.message || 'Neznámá chyba'));
      console.error(err);
    }
  };

  return { warehouses, loading, create, refresh };
}
