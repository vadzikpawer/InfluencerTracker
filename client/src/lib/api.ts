import axios from 'axios';
import { User, Project, Comment, Activity } from './types';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterResponse {
  access_token: string;
  token_type: string;
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string, name: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { username, password, name });
    return response.data;
  },
};

export const projects = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },
  get: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },
  create: async (data: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export const comments = {
  list: async (): Promise<Comment[]> => {
    const response = await api.get<Comment[]>('/comments');
    return response.data;
  },
  get: async (id: number): Promise<Comment> => {
    const response = await api.get<Comment>(`/comments/${id}`);
    return response.data;
  },
  create: async (data: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};

export const activities = {
  list: async (): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/activities');
    return response.data;
  },
  get: async (id: number): Promise<Activity> => {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },
  create: async (data: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> => {
    const response = await api.post<Activity>('/activities', data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
};

export default api; 