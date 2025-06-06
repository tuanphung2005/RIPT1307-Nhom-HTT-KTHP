import axios, { AxiosResponse } from 'axios';
import { message } from 'antd';
import { API_CONFIG, getApiUrl, getAuthHeaders } from './config';

// Create axios
const backendApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// add auth
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('forum_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
backendApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized
          localStorage.removeItem('forum_token');
          localStorage.removeItem('forum_current_user');
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // k redirect
          break;
          
        case 403:
          message.error('Bạn không có quyền thực hiện thao tác này');
          break;
          
        case 404:
          message.error('Không tìm thấy dữ liệu');
          break;
          
        case 500:
          message.error('Lỗi server. Vui lòng thử lại sau.');
          break;
          
        default:
          message.error(data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } else if (error.request) {
      message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
    
    return Promise.reject(error);
  }
);

// Backend API service class
export class BackendApiService {  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {

      const response = await axios.get(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // GET request
  async get<T = any>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await backendApi.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await backendApi.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await backendApi.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // DELETE request
  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await backendApi.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const backendApiService = new BackendApiService();
export default backendApi;
