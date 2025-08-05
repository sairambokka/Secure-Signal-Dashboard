import axios from 'axios';
import { AuthResponse, SignalsResponse, User, Signal } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

export const signalsApi = {
  create: async (signalData: {
    agent_id: string;
    signal_type: string;
    timestamp: string;
    payload: {
      raw: any[];
      avg: number;
      sdnn?: number;
    };
    context?: {
      activity?: string;
      environment?: string;
    };
  }): Promise<{ success: boolean; data: { signal: Signal } }> => {
    const response = await api.post('/signals', signalData);
    return response.data;
  },

  getAll: async (filters?: {
    type?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<SignalsResponse> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await api.get(`/signals?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: { signal: Signal } }> => {
    const response = await api.get(`/signals/${id}`);
    return response.data;
  },


  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/signals/${id}`);
    return response.data;
  },
};

export default api;