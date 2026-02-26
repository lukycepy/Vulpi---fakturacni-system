import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { getPipeline } from '../api/get-pipeline';
import { toast } from 'sonner';

export function usePipeline(organizationId: string | undefined) {
  const { fetchWithAuth } = useAuth();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipeline = () => {
    if (organizationId) {
        setLoading(true);
        getPipeline(organizationId, fetchWithAuth)
          .then(setStages)
          .catch(err => {
            setError(err);
            toast.error('Chyba při načítání obchodu: ' + (err.message || 'Neznámá chyba'));
          })
          .finally(() => setLoading(false));
      }
  };

  useEffect(() => {
    fetchPipeline();
  }, [organizationId, fetchWithAuth]);

  return { stages, setStages, loading, error, refresh: fetchPipeline };
}
