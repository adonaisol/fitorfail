import { RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import type { WorkoutPlan, WorkoutDay } from '../../types';
import DayCard from './DayCard';

interface WeeklyPlanViewProps {
  plan: WorkoutPlan;
  onRefreshPlan: (planId: number) => Promise<void>;
  onRefreshDay: (planId: number, dayNumber: number) => Promise<WorkoutDay | void>;
  onCompleteExercise: (sessionExerciseId: number) => Promise<void>;
  isRefreshing?: boolean;
}

export default function WeeklyPlanView({
  plan,
  onRefreshPlan,
  onRefreshDay,
  onCompleteExercise,
  isRefreshing = false
}: WeeklyPlanViewProps): JSX.Element {
  // Calculate overall progress
  const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const completedExercises = plan.days.reduce(
    (sum, day) => sum + day.exercises.filter(e => e.completed).length,
    0
  );
  const progressPercent = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  const isComplete = completedExercises === totalExercises && totalExercises > 0;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Plan header */}
      <div className="card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isComplete ? 'bg-green-100' : 'bg-primary-100'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Calendar className="w-6 h-6 text-primary-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Week of {formatDate(plan.weekStartDate)}
                </h2>
                <p className="text-sm text-gray-500">
                  {plan.workoutDays}-day split
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : plan.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {plan.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Refresh all button */}
            <button
              onClick={() => onRefreshPlan(plan.planId)}
              disabled={isRefreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh All</span>
            </button>
          </div>

          {/* Overall progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
                {completedExercises}/{totalExercises} exercises
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isComplete ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {plan.days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            planId={plan.planId}
            onRefreshDay={onRefreshDay}
            onCompleteExercise={onCompleteExercise}
          />
        ))}
      </div>
    </div>
  );
}
