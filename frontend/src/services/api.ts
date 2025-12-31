import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  WorkoutPlan,
  WorkoutDay,
  WorkoutPlanSummary,
  UserProfile,
  PreferencesOptions,
  ExerciseRating,
  UserStats,
  HistoryPlan,
  ActivePlanInfo,
  SessionExercise
} from '../types';

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

  getActivePlanInfo: async (): Promise<{ activePlan: ActivePlanInfo | null }> => {
    const response = await api.get<{ activePlan: ActivePlanInfo | null }>('/workouts/active-info');
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

  refreshUncompletedExercises: async (planId: number, dayNumber: number): Promise<{ message: string; day: WorkoutDay }> => {
    const response = await api.post<{ message: string; day: WorkoutDay }>(`/workouts/${planId}/days/${dayNumber}/refresh-uncompleted`);
    return response.data;
  },

  refreshIncompleteDays: async (planId: number): Promise<{ message: string; refreshedDays: number[]; plan: WorkoutPlan }> => {
    const response = await api.post<{ message: string; refreshedDays: number[]; plan: WorkoutPlan }>(`/workouts/${planId}/refresh-incomplete`);
    return response.data;
  },

  completeExercise: async (sessionExerciseId: number, setsCompleted?: number): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/workouts/exercises/${sessionExerciseId}/complete`, { setsCompleted });
    return response.data;
  },

  uncompleteExercise: async (sessionExerciseId: number): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/workouts/exercises/${sessionExerciseId}/uncomplete`);
    return response.data;
  },

  replaceExercise: async (sessionExerciseId: number): Promise<{ message: string; exercise: SessionExercise }> => {
    const response = await api.post<{ message: string; exercise: SessionExercise }>(`/workouts/exercises/${sessionExerciseId}/replace`);
    return response.data;
  },

  getHistory: async (limit = 10, offset = 0): Promise<{ plans: WorkoutPlanSummary[]; pagination: { total: number; limit: number; offset: number } }> => {
    const response = await api.get<{ plans: WorkoutPlanSummary[]; pagination: { total: number; limit: number; offset: number } }>(`/workouts/history?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

// Preferences API
export const preferencesApi = {
  get: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/preferences');
    return response.data;
  },

  update: async (data: {
    workoutDays?: number;
    preferredEquipment?: string[];
    avoidedBodyParts?: string[];
    skillLevel?: string;
  }): Promise<{ message: string } & UserProfile> => {
    const response = await api.put<{ message: string } & UserProfile>('/preferences', data);
    return response.data;
  },

  getOptions: async (): Promise<PreferencesOptions> => {
    const response = await api.get<PreferencesOptions>('/preferences/options');
    return response.data;
  }
};

// Exercise Rating API
export const ratingApi = {
  rate: async (exerciseId: number, rating: number, notes?: string): Promise<{ message: string; rating: ExerciseRating }> => {
    const response = await api.post<{ message: string; rating: ExerciseRating }>(`/exercises/${exerciseId}/rate`, { rating, notes });
    return response.data;
  },

  get: async (exerciseId: number): Promise<ExerciseRating> => {
    const response = await api.get<ExerciseRating>(`/exercises/${exerciseId}/rating`);
    return response.data;
  },

  remove: async (exerciseId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/exercises/${exerciseId}/rating`);
    return response.data;
  }
};

// Stats API
export const statsApi = {
  getStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/stats');
    return response.data;
  },

  getHistory: async (limit = 10, offset = 0, includeCancelled = false): Promise<{ plans: HistoryPlan[]; pagination: { total: number; limit: number; offset: number } }> => {
    const response = await api.get<{ plans: HistoryPlan[]; pagination: { total: number; limit: number; offset: number } }>(`/stats/history?limit=${limit}&offset=${offset}&includeCancelled=${includeCancelled}`);
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
