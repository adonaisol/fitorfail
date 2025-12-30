import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import { WeeklyPlanView } from '../components/workout';
import { WorkoutPlanSkeleton } from '../components/common/Skeleton';

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
    clearError
  } = useWorkout();

  useEffect(() => {
    fetchCurrentPlan();
  }, [fetchCurrentPlan]);

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
            <Link to="/generate" className="btn-primary inline-flex gap-2">
              <Plus className="w-5 h-5" />
              Generate Workout Plan
            </Link>
          </div>

          {/* Quick Stats Preview (Placeholder) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="card">
              <div className="text-3xl font-bold text-primary-500">0</div>
              <div className="text-sm text-gray-600">Workouts This Week</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-success-500">0</div>
              <div className="text-sm text-gray-600">Exercises Completed</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-warning-500">0</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-gray-700">0</div>
              <div className="text-sm text-gray-600">Total Workouts</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
