import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User, WorkoutPlan, WorkoutDay, WorkoutPlanSummary } from '../types';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  }
};

// Workout API
export const workoutApi = {
  generate: async (workoutDays?: number): Promise<{ message: string; plan: WorkoutPlan }> => {
    const response = await api.post<{ message: string; plan: WorkoutPlan }>('/workouts/generate', { workoutDays });
    return response.data;
  },

  getCurrent: async (): Promise<{ plan: WorkoutPlan }> => {
    const response = await api.get<{ plan: WorkoutPlan }>('/workouts/current');
    return response.data;
  },

  getById: async (planId: number): Promise<{ plan: WorkoutPlan }> => {
    const response = await api.get<{ plan: WorkoutPlan }>(`/workouts/${planId}`);
    return response.data;
  },

  activate: async (planId: number): Promise<{ message: string; plan: WorkoutPlan }> => {
    const response = await api.put<{ message: string; plan: WorkoutPlan }>(`/workouts/${planId}/activate`);
    return response.data;
  },

  refreshPlan: async (planId: number): Promise<{ message: string; plan: WorkoutPlan }> => {
    const response = await api.post<{ message: string; plan: WorkoutPlan }>(`/workouts/${planId}/refresh`);
    return response.data;
  },

  refreshDay: async (planId: number, dayNumber: number): Promise<{ message: string; day: WorkoutDay }> => {
    const response = await api.post<{ message: string; day: WorkoutDay }>(`/workouts/${planId}/days/${dayNumber}/refresh`);
    return response.data;
  },

  completeExercise: async (sessionExerciseId: number, setsCompleted?: number): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/workouts/exercises/${sessionExerciseId}/complete`, { setsCompleted });
    return response.data;
  },

  getHistory: async (limit = 10, offset = 0): Promise<{ plans: WorkoutPlanSummary[]; pagination: { total: number; limit: number; offset: number } }> => {
    const response = await api.get<{ plans: WorkoutPlanSummary[]; pagination: { total: number; limit: number; offset: number } }>(`/workouts/history?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

// Helper to get error message from API error
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: string }>;
    return axiosError.response?.data?.error || axiosError.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default api;
