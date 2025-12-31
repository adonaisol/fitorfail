import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Plus, AlertCircle, Flame, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { statsApi } from '../services/api';
import { WeeklyPlanView } from '../components/workout';
import { WorkoutPlanSkeleton, StatsGridSkeleton } from '../components/common/Skeleton';
import type { UserStats } from '../types';

export default function HomePage(): JSX.Element {
  const { user } = useAuth();
  const {
    currentPlan,
    isLoading,
    error,
    fetchCurrentPlan,
    refreshPlan,
    refreshIncompleteDays,
    refreshDay,
    refreshUncompletedExercises,
    completeExercise,
    uncompleteExercise,
    replaceExercise,
    clearError
  } = useWorkout();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const data = await statsApi.getStats();
      setStats(data);
    } catch (err) {
      setStatsError('Failed to load stats');
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentPlan();
    fetchStats();
  }, [fetchCurrentPlan, fetchStats]);

  // Loading state with skeleton
  if (isLoading && !currentPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Fitness Level: <span className="font-medium text-primary-500">{user?.skillLevel || 'Unknown'}</span>
          </p>
        </div>
        <WorkoutPlanSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Fitness Level: <span className="font-medium text-primary-500">{user?.skillLevel || 'Unknown'}</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Show workout plan or empty state */}
      {currentPlan ? (
        <WeeklyPlanView
          plan={currentPlan}
          onRefreshPlan={refreshPlan}
          onRefreshIncompleteDays={refreshIncompleteDays}
          onRefreshDay={refreshDay}
          onRefreshUncompleted={refreshUncompletedExercises}
          onCompleteExercise={completeExercise}
          onUncompleteExercise={uncompleteExercise}
          onReplaceExercise={replaceExercise}
          isRefreshing={isLoading}
        />
      ) : (
        <>
          {/* No Workout Plan State */}
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Workout Plan</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate your personalized weekly workout plan based on your preferences and fitness level.
            </p>
            <Link to="/home/generate" className="btn-primary inline-flex gap-2">
              <Plus className="w-5 h-5" />
              Generate Workout Plan
            </Link>
          </div>

          {/* Quick Stats Preview */}
          <div className="mt-6">
            {isLoadingStats ? (
              <StatsGridSkeleton />
            ) : statsError ? (
              <div className="card p-4 text-center text-gray-500">
                <p>{statsError}</p>
                <button
                  onClick={fetchStats}
                  className="text-primary-500 hover:text-primary-600 text-sm mt-2"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-primary-500 mb-1">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-primary-500">
                    {stats?.overview.completedThisWeek || 0}
                  </div>
                  <div className="text-sm text-gray-600">This Week</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <Dumbbell className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {stats?.overview.totalExercisesCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">Exercises Done</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Flame className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-orange-500">
                    {stats?.streaks.current || 0}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 text-purple-500 mb-1">
                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-purple-500">
                    {stats?.overview.totalPlans || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Plans</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
