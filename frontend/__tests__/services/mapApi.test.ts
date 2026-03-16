import axios from 'axios';
import { server } from '../../msw/server';

describe('Map API Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const api = axios.create({
    baseURL: '/api/v1',
    timeout: 5000,
  });

  describe('GET /map/points', () => {
    it('returns map points for all types', async () => {
      const response = await api.get('/map/points', {
        params: { lat: 39.9, lng: 116.4, types: 'rescue,adoption' },
      });

      expect(response.data).toHaveProperty('code', 0);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('returns only rescue points', async () => {
      const response = await api.get('/map/points', {
        params: { lat: 39.9, lng: 116.4, types: 'rescue' },
      });

      expect(response.data).toHaveProperty('code', 0);
      const points = response.data.data;
      points.forEach((point: any) => {
        expect(point.type).toBe('rescue');
      });
    });

    it('returns only adoption points', async () => {
      const response = await api.get('/map/points', {
        params: { lat: 39.9, lng: 116.4, types: 'adoption' },
      });

      expect(response.data).toHaveProperty('code', 0);
      const points = response.data.data;
      points.forEach((point: any) => {
        expect(point.type).toBe('adoption');
      });
    });

    it('includes required fields in response', async () => {
      const response = await api.get('/map/points', {
        params: { lat: 39.9, lng: 116.4 },
      });

      const point = response.data.data[0];
      expect(point).toHaveProperty('id');
      expect(point).toHaveProperty('type');
      expect(point).toHaveProperty('markerColor');
      expect(point).toHaveProperty('lat');
      expect(point).toHaveProperty('lng');
      expect(point).toHaveProperty('title');
      expect(point).toHaveProperty('status');
    });
  });
});
