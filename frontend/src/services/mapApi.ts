import { api } from './api';
import type {
  MapPoint,
  HeatmapPoint,
  MapPointsParams,
  HeatmapParams,
  Rescue,
  RescuePublishRequest,
  RescueDetailResponse,
  Adoption,
  AdoptionPublishRequest,
  AdoptionDetailResponse,
  StatusUpdateRequest,
} from '../types/rescue';

// ===== 地图API =====

/**
 * 获取地图上的信息点
 */
export async function getMapPoints(params: MapPointsParams): Promise<MapPoint[]> {
  return api.get<MapPoint[]>('/map/points', {
    lat: params.lat,
    lng: params.lng,
    radius: params.radius || 5,
    types: params.types,
  });
}

/**
 * 获取热力图数据
 */
export async function getHeatmapData(params: HeatmapParams): Promise<HeatmapPoint[]> {
  return api.get<HeatmapPoint[]>('/map/heatmap', {
    lat: params.lat,
    lng: params.lng,
    radius: params.radius || 10,
  });
}

// ===== 救助信息API =====

/**
 * 发布救助信息
 */
export async function publishRescue(data: RescuePublishRequest): Promise<Rescue> {
  // 使用FormData支持文件上传
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images') {
      (value as string[]).forEach((img, index) => {
        formData.append(`images[${index}]`, img);
      });
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return api.post<Rescue>('/rescue/publish', formData);
}

/**
 * 获取救助详情
 */
export async function getRescueDetail(id: number): Promise<RescueDetailResponse> {
  return api.get<RescueDetailResponse>(`/rescue/${id}`);
}

/**
 * 更新救助状态
 */
export async function updateRescueStatus(
  id: number,
  data: StatusUpdateRequest
): Promise<Rescue> {
  return api.put<Rescue>(`/rescue/${id}/status`, data);
}

/**
 * 筛选救助信息
 */
export async function filterRescue(params: {
  animalType?: string;
  urgency?: string;
  distance?: number;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ records: Rescue[]; total: number }> {
  return api.get('/rescue/filter', params);
}

// ===== 领养信息API =====

/**
 * 发布领养信息
 */
export async function publishAdoption(data: AdoptionPublishRequest): Promise<Adoption> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images') {
      (value as string[]).forEach((img, index) => {
        formData.append(`images[${index}]`, img);
      });
    } else if (key === 'healthStatus') {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return api.post<Adoption>('/adoption/publish', formData);
}

/**
 * 获取领养详情
 */
export async function getAdoptionDetail(id: number): Promise<AdoptionDetailResponse> {
  return api.get<AdoptionDetailResponse>(`/adoption/${id}`);
}

/**
 * 更新领养状态
 */
export async function updateAdoptionStatus(
  id: number,
  data: { status: string }
): Promise<Adoption> {
  return api.put<Adoption>(`/adoption/${id}/status`, data);
}

/**
 * 筛选领养信息
 */
export async function filterAdoption(params: {
  animalType?: string;
  breed?: string;
  age?: string;
  gender?: string;
  size?: string;
  vaccinated?: boolean;
  distance?: number;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ records: Adoption[]; total: number }> {
  return api.get('/adoption/filter', params);
}
