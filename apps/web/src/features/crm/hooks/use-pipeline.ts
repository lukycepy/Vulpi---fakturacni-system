import { useState, useEffect } from 'react';
import { getPipeline } from '../api/get-pipeline';

export function usePipeline(organizationId: string | undefined) {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipeline = () => {
    if (organizationId) {
        setLoading(true);
        getPipeline(organizationId)
          .then(setStages)
          .catch(setError)
          .finally(() => setLoading(false));
      }
  };

  useEffect(() => {
    fetchPipeline();
  }, [organizationId]);

  return { stages, setStages, loading, error, refresh: fetchPipeline };
}
