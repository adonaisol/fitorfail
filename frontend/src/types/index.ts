// User types
export interface User {
  id: number;
  username: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert';
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Expert';
}

// Exercise types
export interface Exercise {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  body_part: string | null;
  equipment: string | null;
  level: string | null;
  rating: number | null;
  rating_desc: string | null;
}

export interface ExerciseFilters {
  bodyParts: string[];
  equipment: string[];
  levels: string[];
  types: string[];
}

export interface PaginatedResponse<T> {
  exercises: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// API Error
export interface ApiError {
  error: string;
}

// Workout types
export interface SessionExercise {
  sessionExerciseId: number;
  exerciseId: number;
  orderIndex: number;
  sets: number;
  reps: string;
  completed: boolean;
  title: string;
  description: string | null;
  type: string | null;
  bodyPart: string | null;
  equipment: string | null;
  level: string | null;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  focusBodyParts: string[];
  exercises: SessionExercise[];
}

export interface WorkoutPlan {
  planId: number;
  weekStartDate: string;
  workoutDays: number;
  status: 'draft' | 'active' | 'completed';
  days: WorkoutDay[];
}

export interface WorkoutPlanSummary {
  id: number;
  week_start_date: string;
  workout_days: number;
  status: string;
  created_at: string;
}

// User preferences types
export interface UserPreferences {
  workoutDays: 3 | 4 | 5;
  preferredEquipment: string[];
  avoidedBodyParts: string[];
}

export interface UserProfile {
  user: User;
  preferences: UserPreferences;
}

export interface PreferencesOptions {
  equipment: string[];
  bodyParts: string[];
}

// Exercise rating types
export interface ExerciseRating {
  exerciseId: number;
  rating: number | null;
  notes: string | null;
}

// Stats types
export interface UserStats {
  overview: {
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    totalExercisesCompleted: number;
    totalExercisesAssigned: number;
    completedThisWeek: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
  topExercises: {
    exercise_id: number;
    title: string;
    times_completed: number;
  }[];
  topBodyParts: {
    body_part: string;
    times_worked: number;
  }[];
  recentActivity: {
    date: string;
    exercises_completed: number;
  }[];
}

export interface HistoryPlan {
  id: number;
  weekStartDate: string;
  workoutDays: number;
  status: string;
  createdAt: string;
  totalExercises: number;
  completedExercises: number;
  completionPercent: number;
}

export interface ActivePlanInfo {
  planId: number;
  weekStartDate: string;
  completedExercises: number;
  totalExercises: number;
}
