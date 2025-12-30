interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps): JSX.Element {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function WorkoutPlanSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Plan header skeleton */}
      <div className="card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Day cards skeleton */}
      {[1, 2, 3].map((day) => (
        <DayCardSkeleton key={day} />
      ))}
    </div>
  );
}

export function DayCardSkeleton(): JSX.Element {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
        <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
      </div>

      {/* Exercises */}
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4].map((ex) => (
          <ExerciseCardSkeleton key={ex} />
        ))}
      </div>
    </div>
  );
}

export function ExerciseCardSkeleton(): JSX.Element {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  );
}

export default Skeleton;
