import { useState, memo, useCallback, useMemo } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WorkoutDay } from '../../types';
import ExerciseCard from './ExerciseCard';
import ConfirmDialog from '../common/ConfirmDialog';

interface DayCardProps {
  day: WorkoutDay;
  planId: number;
  onRefreshDay: (planId: number, dayNumber: number) => Promise<WorkoutDay | void>;
  onRefreshUncompleted: (planId: number, dayNumber: number) => Promise<WorkoutDay | void>;
  onCompleteExercise: (sessionExerciseId: number) => Promise<void>;
  onUncompleteExercise: (sessionExerciseId: number) => Promise<void>;
  onReplaceExercise: (sessionExerciseId: number) => Promise<void>;
}

const DayCard = memo(function DayCard({ day, planId, onRefreshDay, onRefreshUncompleted, onCompleteExercise, onUncompleteExercise, onReplaceExercise }: DayCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

  // Memoize computed values
  const { completedCount, totalCount, uncompletedCount, isComplete, progressPercent, hasCompletedExercises, hasUncompletedExercises } = useMemo(() => {
    const completed = day.exercises.filter(e => e.completed).length;
    const total = day.exercises.length;
    const uncompleted = total - completed;
    return {
      completedCount: completed,
      totalCount: total,
      uncompletedCount: uncompleted,
      isComplete: completed === total && total > 0,
      progressPercent: total > 0 ? (completed / total) * 100 : 0,
      hasCompletedExercises: completed > 0,
      hasUncompletedExercises: uncompleted > 0
    };
  }, [day.exercises]);

  const handleRefreshClick = useCallback(() => {
    if (hasCompletedExercises) {
      setShowRefreshConfirm(true);
    } else {
      handleRefreshAll();
    }
  }, [hasCompletedExercises]);

  const handleRefreshAll = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setShowRefreshConfirm(false);
    try {
      await onRefreshDay(planId, day.dayNumber);
      toast.success(`${day.dayName} refreshed`);
    } catch {
      toast.error('Failed to refresh day');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefreshDay, planId, day.dayNumber, day.dayName]);

  const handleRefreshUncompleted = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setShowRefreshConfirm(false);
    try {
      await onRefreshUncompleted(planId, day.dayNumber);
      toast.success(`Refreshed ${uncompletedCount} uncompleted exercise${uncompletedCount === 1 ? '' : 's'}`);
    } catch {
      toast.error('Failed to refresh uncompleted exercises');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefreshUncompleted, planId, day.dayNumber, uncompletedCount]);

  const getRefreshDialogActions = useCallback(() => {
    const actions = [];

    if (hasUncompletedExercises) {
      actions.push({
        label: `Refresh ${uncompletedCount} Uncompleted`,
        variant: 'default' as const,
        onClick: handleRefreshUncompleted
      });
    }

    actions.push({
      label: 'Refresh All Exercises',
      variant: 'warning' as const,
      onClick: handleRefreshAll
    });

    return actions;
  }, [hasUncompletedExercises, uncompletedCount, handleRefreshUncompleted, handleRefreshAll]);

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);
  const closeRefreshConfirm = useCallback(() => setShowRefreshConfirm(false), []);

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
              {isComplete ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : day.dayNumber}
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
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={`Refresh ${day.dayName} exercises`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>

            {/* Expand/collapse */}
            <button
              onClick={toggleExpanded}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `Collapse ${day.dayName}` : `Expand ${day.dayName}`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${day.dayName} progress: ${completedCount} of ${totalCount} exercises completed`}
        >
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
        <div className="p-2 sm:p-4 space-y-2">
          {day.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.sessionExerciseId}
              exercise={exercise}
              onComplete={onCompleteExercise}
              onUncomplete={onUncompleteExercise}
              onReplace={onReplaceExercise}
            />
          ))}
        </div>
      )}

      {/* Refresh confirmation dialog */}
      <ConfirmDialog
        isOpen={showRefreshConfirm}
        title="Refresh Day?"
        message={`You have ${completedCount} completed exercise${completedCount === 1 ? '' : 's'} in this day. Choose how to refresh:`}
        cancelLabel="Cancel"
        variant="warning"
        onCancel={closeRefreshConfirm}
        actions={getRefreshDialogActions()}
      />
    </div>
  );
});

export default DayCard;
