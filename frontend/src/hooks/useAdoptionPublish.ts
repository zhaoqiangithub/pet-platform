import { useState } from 'react';
import { publishAdoption } from '../services/mapApi';
import type { AdoptionPublishRequest, Adoption } from '../types/rescue';

interface UseAdoptionPublishResult {
  publish: (data: AdoptionPublishRequest) => Promise<Adoption>;
  loading: boolean;
  error: Error | null;
}

export function useAdoptionPublish(): UseAdoptionPublishResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publish = async (data: AdoptionPublishRequest): Promise<Adoption> => {
    setLoading(true);
    setError(null);
    try {
      const result = await publishAdoption(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    publish,
    loading,
    error,
  };
}
