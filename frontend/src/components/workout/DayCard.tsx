import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { WorkoutDay } from '../../types';
import ExerciseCard from './ExerciseCard';

interface DayCardProps {
  day: WorkoutDay;
  planId: number;
  onRefreshDay: (planId: number, dayNumber: number) => Promise<WorkoutDay | void>;
  onCompleteExercise: (sessionExerciseId: number) => Promise<void>;
}

export default function DayCard({ day, planId, onRefreshDay, onCompleteExercise }: DayCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const completedCount = day.exercises.filter(e => e.completed).length;
  const totalCount = day.exercises.length;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshDay(planId, day.dayNumber);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={`card overflow-hidden ${isComplete ? 'ring-2 ring-green-500' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Day number badge */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              isComplete
                ? 'bg-green-500 text-white'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {isComplete ? <CheckCircle2 className="w-5 h-5" /> : day.dayNumber}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{day.dayName}</h3>
              <p className="text-xs text-gray-500">
                {day.focusBodyParts.slice(0, 3).join(', ')}
                {day.focusBodyParts.length > 3 && ` +${day.focusBodyParts.length - 3}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress */}
            <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
              {completedCount}/{totalCount}
            </span>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh exercises"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Expand/collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {day.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.sessionExerciseId}
              exercise={exercise}
              onComplete={onCompleteExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
}
