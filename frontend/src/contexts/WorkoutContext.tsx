import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { workoutApi, getErrorMessage } from '../services/api';
import type { WorkoutPlan, WorkoutDay } from '../types';

interface WorkoutContextType {
  currentPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentPlan: () => Promise<void>;
  generatePlan: (workoutDays?: number) => Promise<WorkoutPlan>;
  activatePlan: (planId: number) => Promise<void>;
  refreshPlan: (planId: number) => Promise<void>;
  refreshDay: (planId: number, dayNumber: number) => Promise<WorkoutDay>;
  completeExercise: (sessionExerciseId: number, setsCompleted?: number) => Promise<void>;
  clearError: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps): JSX.Element {
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCurrentPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workoutApi.getCurrent();
      setCurrentPlan(response.plan);
    } catch (err) {
      // 404 means no active plan, which is okay
      if ((err as { response?: { status: number } }).response?.status === 404) {
        setCurrentPlan(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async (workoutDays?: number): Promise<WorkoutPlan> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workoutApi.generate(workoutDays);
      return response.plan;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activatePlan = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workoutApi.activate(planId);
      setCurrentPlan(response.plan);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPlan = useCallback(async (planId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workoutApi.refreshPlan(planId);
      setCurrentPlan(response.plan);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDay = useCallback(async (planId: number, dayNumber: number): Promise<WorkoutDay> => {
    setError(null);
    try {
      const response = await workoutApi.refreshDay(planId, dayNumber);
      // Update the current plan with the refreshed day
      setCurrentPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map(d => d.dayNumber === dayNumber ? response.day : d)
        };
      });
      return response.day;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  const completeExercise = useCallback(async (sessionExerciseId: number, setsCompleted?: number) => {
    setError(null);
    try {
      await workoutApi.completeExercise(sessionExerciseId, setsCompleted);
      // Update the current plan to mark exercise as completed
      setCurrentPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map(day => ({
            ...day,
            exercises: day.exercises.map(ex =>
              ex.sessionExerciseId === sessionExerciseId
                ? { ...ex, completed: true }
                : ex
            )
          }))
        };
      });
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  const value: WorkoutContextType = {
    currentPlan,
    isLoading,
    error,
    fetchCurrentPlan,
    generatePlan,
    activatePlan,
    refreshPlan,
    refreshDay,
    completeExercise,
    clearError
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

export default WorkoutContext;
