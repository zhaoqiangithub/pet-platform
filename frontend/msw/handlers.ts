import { http, HttpResponse, delay } from 'msw';
import type { Rescue, Adoption, MapPoint } from '../src/types/rescue';

// Mock data
const mockRescues: Rescue[] = [
  {
    id: 1,
    userId: 100,
    animalType: 'cat',
    healthStatus: 'healthy',
    rescueStatus: 'pending',
    locationLat: 39.9042,
    locationLng: 116.4074,
    address: '北京市朝阳区',
    description: '一只可爱的流浪猫',
    breed: '中华田园猫',
    age: 'adult',
    contactPhone: '13800138000',
    images: ['https://example.com/cat.jpg'],
    reviewStatus: 'approved',
    createTime: '2024-01-15T10:00:00Z',
    updateTime: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 101,
    animalType: 'dog',
    healthStatus: 'injured',
    rescueStatus: 'rescuing',
    locationLat: 39.9142,
    locationLng: 116.4174,
    address: '北京市海淀区',
    description: '受伤的流浪狗',
    breed: '柴犬',
    age: 'adult',
    contactPhone: '13800138001',
    images: ['https://example.com/dog.jpg'],
    reviewStatus: 'approved',
    createTime: '2024-01-14T10:00:00Z',
    updateTime: '2024-01-14T10:00:00Z',
  },
];

const mockAdoptions: Adoption[] = [
  {
    id: 1,
    userId: 100,
    name: '小白',
    animalType: 'cat',
    breed: '中华田园猫',
    age: 'adult',
    gender: 'male',
    personality: '活泼可爱',
    healthStatus: { vaccinated: true, dewormed: true, neutered: false },
    requirements: '有爱心',
    images: ['https://example.com/cat2.jpg'],
    adoptionStatus: 'available',
    reviewStatus: 'approved',
    createTime: '2024-01-15T10:00:00Z',
    updateTime: '2024-01-15T10:00:00Z',
  },
];

// API handlers
export const handlers = [
  // Rescue endpoints
  http.get('/api/v1/rescue/nearby', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseInt(url.searchParams.get('radius') || '5000', 10);

    // Filter by distance (simplified)
    const nearbyRescues = mockRescues.filter((r) => {
      const distance = Math.sqrt(
        Math.pow(r.locationLat - lat, 2) + Math.pow(r.locationLng - lng, 2)
      );
      return distance * 111 < radius / 1000; // rough km conversion
    });

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: nearbyRescues,
    });
  }),

  http.get('/api/v1/rescue/:id', async ({ params }) => {
    await delay(100);
    const id = parseInt(params.id as string, 10);
    const rescue = mockRescues.find((r) => r.id === id);

    if (!rescue) {
      return HttpResponse.json(
        { code: 404, message: 'Rescue not found', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: rescue,
    });
  }),

  http.post('/api/v1/rescue/publish', async ({ request }) => {
    await delay(200);
    const body = await request.json() as Partial<Rescue>;

    const newRescue: Rescue = {
      id: Math.floor(Math.random() * 10000),
      userId: 100,
      animalType: body.animalType || 'cat',
      healthStatus: body.healthStatus || 'healthy',
      rescueStatus: 'pending',
      locationLat: body.locationLat || 0,
      locationLng: body.locationLng || 0,
      address: body.address,
      description: body.description,
      breed: body.breed,
      age: body.age,
      contactPhone: body.contactPhone || '',
      images: body.images || [],
      reviewStatus: 'pending',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: newRescue,
    });
  }),

  // Adoption endpoints
  http.get('/api/v1/adoption/nearby', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockAdoptions,
    });
  }),

  http.get('/api/v1/adoption/:id', async ({ params }) => {
    await delay(100);
    const id = parseInt(params.id as string, 10);
    const adoption = mockAdoptions.find((a) => a.id === id);

    if (!adoption) {
      return HttpResponse.json(
        { code: 404, message: 'Adoption not found', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: adoption,
    });
  }),

  // Map points endpoint
  http.get('/api/v1/map/points', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const types = url.searchParams.get('types') || 'rescue,adoption';

    const points: MapPoint[] = [];

    if (types.includes('rescue')) {
      mockRescues.forEach((r) => {
        points.push({
          id: r.id,
          type: 'rescue',
          markerColor: r.rescueStatus === 'pending' ? 'yellow' : 'red',
          lat: r.locationLat,
          lng: r.locationLng,
          title: r.breed || '待救助',
          status: r.rescueStatus,
          animalType: r.animalType,
          thumbnailImages: r.images,
          createTime: r.createTime,
        });
      });
    }

    if (types.includes('adoption')) {
      mockAdoptions.forEach((a) => {
        points.push({
          id: a.id,
          type: 'adoption',
          markerColor: 'green',
          lat: 39.9142,
          lng: 116.4174,
          title: a.name || a.breed,
          status: a.adoptionStatus,
          animalType: a.animalType,
          thumbnailImages: a.images,
          createTime: a.createTime,
        });
      });
    }

    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: points,
    });
  }),
];
