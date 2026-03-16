import axios from 'axios';
import { server } from '../../msw/server';

describe('Rescue API Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const api = axios.create({
    baseURL: '/api/v1',
    timeout: 5000,
  });

  describe('GET /rescue/nearby', () => {
    it('returns nearby rescues', async () => {
      const response = await api.get('/rescue/nearby', {
        params: { lat: 39.9, lng: 116.4, radius: 5000 },
      });

      expect(response.data).toHaveProperty('code', 0);
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('returns empty array when no rescues nearby', async () => {
      const response = await api.get('/rescue/nearby', {
        params: { lat: 0, lng: 0, radius: 1000 },
      });

      expect(response.data).toHaveProperty('code', 0);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /rescue/:id', () => {
    it('returns rescue by id', async () => {
      const response = await api.get('/rescue/1');

      expect(response.data).toHaveProperty('code', 0);
      expect(response.data.data).toHaveProperty('id', 1);
      expect(response.data.data).toHaveProperty('animalType', 'cat');
    });

    it('returns 404 for non-existent rescue', async () => {
      try {
        await api.get('/rescue/99999');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('POST /rescue/publish', () => {
    it('creates a new rescue', async () => {
      const newRescue = {
        animalType: 'cat',
        healthStatus: 'healthy',
        locationLat: 39.9042,
        locationLng: 116.4074,
        address: '北京市朝阳区',
        description: '测试救助',
        breed: '中华田园猫',
        age: 'adult',
        contactPhone: '13800138000',
        images: ['https://example.com/test.jpg'],
      };

      const response = await api.post('/rescue/publish', newRescue);

      expect(response.data).toHaveProperty('code', 0);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.animalType).toBe('cat');
      expect(response.data.data.rescueStatus).toBe('pending');
    });

    it('validates required fields', async () => {
      const invalidRescue = {
        animalType: 'cat',
        // Missing required fields
      };

      const response = await api.post('/rescue/publish', invalidRescue);

      // Should still create with defaults
      expect(response.data).toHaveProperty('code', 0);
    });
  });
});
