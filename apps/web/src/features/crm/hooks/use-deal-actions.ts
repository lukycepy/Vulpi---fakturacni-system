import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { updateDealStage } from '../api/update-deal-stage';
import { createDeal } from '../api/create-deal';
import { deleteDeal } from '../api/delete-deal';
import { toast } from 'sonner';

export function useDealActions() {
  const { fetchWithAuth } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateStage = async (dealId: string, stageId: string) => {
    setUpdating(true);
    try {
      await updateDealStage(dealId, stageId, fetchWithAuth);
      toast.success('Obchod byl úspěšně přesunut');
    } catch (error: any) {
      toast.error('Chyba při přesouvání obchodu: ' + (error.message || 'Neznámá chyba'));
      console.error(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const create = async (data: any) => {
    setUpdating(true);
    try {
      const result = await createDeal(data, fetchWithAuth);
      toast.success('Obchod byl úspěšně vytvořen');
      return result;
    } catch (error: any) {
      toast.error('Chyba při vytváření obchodu: ' + (error.message || 'Neznámá chyba'));
      console.error(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (dealId: string) => {
    setUpdating(true);
    try {
      await deleteDeal(dealId, fetchWithAuth);
      toast.success('Obchod byl úspěšně smazán');
    } catch (error: any) {
      toast.error('Chyba při mazání obchodu: ' + (error.message || 'Neznámá chyba'));
      console.error(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateStage, create, remove, updating };
}
