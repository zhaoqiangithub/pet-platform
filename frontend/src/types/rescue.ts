// 救助类型定义

export type AnimalType = 'cat' | 'dog' | 'other';
export type HealthStatus = 'healthy' | 'injured' | 'sick';
export type RescueStatus = 'pending' | 'rescuing' | 'rescued' | 'medical' | 'adopted' | 'closed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface RescueLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Rescue {
  id: number;
  userId: number;
  animalType: AnimalType;
  healthStatus: HealthStatus;
  rescueStatus: RescueStatus;
  locationLat: number;
  locationLng: number;
  address?: string;
  description?: string;
  breed?: string;
  age?: string;
  contactPhone: string;
  contactWechat?: string;
  images: string[];
  reviewStatus: ReviewStatus;
  reviewComment?: string;
  createTime: string;
  updateTime: string;
}

export interface RescuePublishRequest {
  animalType: AnimalType;
  healthStatus: HealthStatus;
  locationLat: number;
  locationLng: number;
  address?: string;
  description?: string;
  breed?: string;
  age?: string;
  contactPhone: string;
  contactWechat?: string;
  images: string[];
}

export interface RescueDetailResponse extends Rescue {
  nickname?: string;
  avatar?: string;
}

export interface StatusUpdateRequest {
  status: RescueStatus;
  progress?: string;
  images?: string[];
}

// ===== 领养类型 =====

export type Age = 'young' | 'adult' | 'senior';
export type Gender = 'male' | 'female';
export type Size = 'small' | 'medium' | 'large';
export type AdoptionStatus = 'available' | 'pending' | 'adopted' | 'closed';

export interface HealthStatus {
  vaccinated?: boolean;
  dewormed?: boolean;
  neutered?: boolean;
}

export interface Adoption {
  id: number;
  userId: number;
  name?: string;
  animalType?: AnimalType;
  breed: string;
  age: Age;
  gender: Gender;
  size?: Size;
  personality: string;
  healthStatus: HealthStatus;
  requirements: string;
  story?: string;
  images: string[];
  contactPhone?: string;
  contactWechat?: string;
  adoptionStatus: AdoptionStatus;
  reviewStatus: ReviewStatus;
  reviewComment?: string;
  createTime: string;
  updateTime: string;
}

export interface AdoptionPublishRequest {
  name?: string;
  animalType?: AnimalType;
  breed: string;
  age: Age;
  gender: Gender;
  size?: Size;
  personality: string;
  healthStatus: HealthStatus;
  requirements: string;
  story?: string;
  images: string[];
  contactPhone?: string;
  contactWechat?: string;
}

export interface AdoptionDetailResponse extends Adoption {
  nickname?: string;
  avatar?: string;
}

// ===== 地图类型 =====

export type MarkerColor = 'red' | 'yellow' | 'green' | 'blue' | 'gray';

export interface MapPoint {
  id: number;
  type: 'rescue' | 'adoption';
  markerColor: MarkerColor;
  lat: number;
  lng: number;
  title: string;
  status: string;
  animalType?: AnimalType;
  thumbnailImages?: string[];
  createTime: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 1-10
}

export interface MapPointsParams {
  lat: number;
  lng: number;
  radius?: number;
  types?: 'rescue' | 'adoption' | 'rescue,adoption';
}

export interface HeatmapParams {
  lat: number;
  lng: number;
  radius?: number;
}
