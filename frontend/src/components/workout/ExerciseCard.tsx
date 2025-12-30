import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import type { SessionExercise } from '../../types';

interface ExerciseCardProps {
  exercise: SessionExercise;
  onComplete: (sessionExerciseId: number) => Promise<void>;
}

export default function ExerciseCard({ exercise, onComplete }: ExerciseCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (exercise.completed || isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete(exercise.sessionExerciseId);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      exercise.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={exercise.completed || isCompleting}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            exercise.completed
              ? 'bg-green-500 text-white'
              : 'border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50'
          }`}
        >
          {exercise.completed && <Check className="w-5 h-5" />}
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
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
          </div>
        </div>
      )}
    </div>
  );
}
