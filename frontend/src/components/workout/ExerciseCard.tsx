import { useState, useEffect, memo, useCallback } from 'react';
import { Check, ChevronDown, ChevronUp, Dumbbell, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SessionExercise } from '../../types';
import { ratingApi } from '../../services/api';
import RatingInput from '../common/RatingInput';

interface ExerciseCardProps {
  exercise: SessionExercise;
  onComplete: (sessionExerciseId: number) => Promise<void>;
  onUncomplete: (sessionExerciseId: number) => Promise<void>;
}

const ExerciseCard = memo(function ExerciseCard({ exercise, onComplete, onUncomplete }: ExerciseCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUncompleting, setIsUncompleting] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [hasFetchedRating, setHasFetchedRating] = useState(false);

  // Fetch user rating when expanded for the first time
  useEffect(() => {
    if (isExpanded && !hasFetchedRating) {
      fetchRating();
    }
  }, [isExpanded, hasFetchedRating]);

  const fetchRating = async () => {
    setIsLoadingRating(true);
    try {
      const result = await ratingApi.get(exercise.exerciseId);
      setUserRating(result.rating);
      setHasFetchedRating(true);
    } catch {
      // Silently fail - rating is optional
    } finally {
      setIsLoadingRating(false);
    }
  };

  const handleRatingChange = useCallback(async (newRating: number) => {
    const previousRating = userRating;
    setUserRating(newRating);

    try {
      if (newRating === 0) {
        await ratingApi.remove(exercise.exerciseId);
        toast.success('Rating removed');
      } else {
        await ratingApi.rate(exercise.exerciseId, newRating);
        toast.success(`Rated ${newRating} stars`);
      }
    } catch {
      setUserRating(previousRating);
      toast.error('Failed to save rating');
    }
  }, [userRating, exercise.exerciseId]);

  const handleComplete = useCallback(async () => {
    if (exercise.completed || isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete(exercise.sessionExerciseId);
      toast.success(`${exercise.title} completed!`);
    } catch {
      toast.error('Failed to complete exercise');
    } finally {
      setIsCompleting(false);
    }
  }, [exercise.completed, exercise.sessionExerciseId, exercise.title, isCompleting, onComplete]);

  const handleUncomplete = useCallback(async () => {
    if (!exercise.completed || isUncompleting) return;
    setIsUncompleting(true);
    try {
      await onUncomplete(exercise.sessionExerciseId);
      toast.success('Exercise unmarked');
    } catch {
      toast.error('Failed to undo completion');
    } finally {
      setIsUncompleting(false);
    }
  }, [exercise.completed, exercise.sessionExerciseId, isUncompleting, onUncomplete]);

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        {/* Complete/Undo button */}
        <button
          onClick={exercise.completed ? handleUncomplete : handleComplete}
          disabled={isCompleting || isUncompleting}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            exercise.completed
              ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
              : 'border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 focus:ring-primary-500'
          }`}
          aria-label={exercise.completed ? `Mark ${exercise.title} as incomplete` : `Mark ${exercise.title} as complete`}
          aria-pressed={exercise.completed}
        >
          {exercise.completed ? (
            isUncompleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )
          ) : isCompleting ? (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          ) : null}
        </button>

        {/* Exercise info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm truncate ${
            exercise.completed ? 'text-green-700' : 'text-gray-900'
          }`}>
            {exercise.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{exercise.sets} sets</span>
            <span className="text-gray-300">|</span>
            <span>{exercise.reps} reps</span>
            {exercise.equipment && (
              <>
                <span className="text-gray-300">|</span>
                <span className="truncate">{exercise.equipment}</span>
              </>
            )}
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={toggleExpanded}
          className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${exercise.title} details` : `Expand ${exercise.title} details`}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <div className="mt-2 space-y-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {exercise.bodyPart && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {exercise.bodyPart}
                </span>
              )}
              {exercise.type && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {exercise.type}
                </span>
              )}
              {exercise.level && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  exercise.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                  exercise.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {exercise.level}
                </span>
              )}
            </div>

            {/* Description */}
            {exercise.description && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {exercise.description}
              </p>
            )}

            {/* Equipment */}
            {exercise.equipment && exercise.equipment !== 'Body Only' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Equipment: {exercise.equipment}</span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Star className="w-3.5 h-3.5" />
                <span>Your rating:</span>
              </div>
              {isLoadingRating ? (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <RatingInput
                  value={userRating}
                  onChange={handleRatingChange}
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ExerciseCard;
