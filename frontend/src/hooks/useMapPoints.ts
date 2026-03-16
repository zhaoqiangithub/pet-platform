import { useState, useEffect, useCallback } from 'react';
import { getMapPoints, getHeatmapData } from '../services/mapApi';
import type { MapPoint, HeatmapPoint } from '../types/rescue';

interface UseMapPointsResult {
  points: MapPoint[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useMapPoints(
  lat: number,
  lng: number,
  radius: number = 5,
  types: 'rescue' | 'adoption' | 'rescue,adoption' = 'rescue,adoption'
): UseMapPointsResult {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getMapPoints({ lat, lng, radius, types });
      setPoints(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius, types]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return {
    points,
    loading,
    error,
    refresh: fetchPoints,
  };
}

interface UseHeatmapResult {
  heatmapPoints: HeatmapPoint[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useHeatmap(
  lat: number,
  lng: number,
  radius: number = 10
): UseHeatmapResult {
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHeatmap = useCallback(async () => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getHeatmapData({ lat, lng, radius });
      setHeatmapPoints(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  return {
    heatmapPoints,
    loading,
    error,
    refresh: fetchHeatmap,
  };
}
