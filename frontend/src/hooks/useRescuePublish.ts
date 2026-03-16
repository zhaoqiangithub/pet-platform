import { useState } from 'react';
import { publishRescue } from '../services/mapApi';
import type { RescuePublishRequest, Rescue } from '../types/rescue';

interface UseRescuePublishResult {
  publish: (data: RescuePublishRequest) => Promise<Rescue>;
  loading: boolean;
  error: Error | null;
}

export function useRescuePublish(): UseRescuePublishResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publish = async (data: RescuePublishRequest): Promise<Rescue> => {
    setLoading(true);
    setError(null);
    try {
      const result = await publishRescue(data);
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
