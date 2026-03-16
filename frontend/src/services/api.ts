import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8085/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器 - 添加token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器 - 统一错误处理
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        const errorResponse = error.response?.data;
        if (errorResponse?.message) {
          // 统一处理错误消息
          console.error('API Error:', errorResponse.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    // 从存储中获取token
    // 实际实现中应该从AsyncStorage或Zustand store中获取
    return null;
  }

  // GET请求
  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.get(url, { params });
  }

  // POST请求
  public async post<T>(url: string, data?: unknown): Promise<T> {
    return this.client.post(url, data);
  }

  // PUT请求
  public async put<T>(url: string, data?: unknown): Promise<T> {
    return this.client.put(url, data);
  }

  // DELETE请求
  public async delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.delete(url, { params });
  }

  // 上传文件
  public async uploadFiles<T>(url: string, files: File[]): Promise<T> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const api = new ApiClient();
