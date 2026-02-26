import { useState } from 'react';
import { updateDealStage } from '../api/update-deal-stage';
import { createDeal } from '../api/create-deal';

export function useDealActions() {
  const [updating, setUpdating] = useState(false);

  const updateStage = async (dealId: string, stageId: string) => {
    setUpdating(true);
    try {
      await updateDealStage(dealId, stageId);
    } finally {
      setUpdating(false);
    }
  };

  const create = async (data: any) => {
    setUpdating(true);
    try {
      return await createDeal(data);
    } finally {
      setUpdating(false);
    }
  };

  return { updateStage, create, updating };
}
