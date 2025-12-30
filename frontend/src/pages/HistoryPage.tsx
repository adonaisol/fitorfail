import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  Flame,
  Trophy,
  Dumbbell,
  ChevronRight,
  Loader2,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { statsApi, getErrorMessage } from '../services/api';
import type { UserStats, HistoryPlan } from '../types';

export default function HistoryPage(): JSX.Element {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<HistoryPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    loadData();
  }, [showCancelled]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        statsApi.getStats(),
        statsApi.getHistory(10, 0, showCancelled)
      ]);
      setStats(statsData);
      setHistory(historyData.plans);
      setPagination(historyData.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || history.length >= pagination.total) return;
    setIsLoadingMore(true);
    try {
      const result = await statsApi.getHistory(10, history.length, showCancelled);
      setHistory(prev => [...prev, ...result.plans]);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="mt-2 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">History & Stats</h1>
        <p className="text-gray-600 mt-1">Track your fitness journey</p>
      </div>

      {/* Stats Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-primary-500 mb-2">
              <Dumbbell className="w-5 h-5" />
              <span className="text-xs font-medium">Exercises Done</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overview.totalExercisesCompleted}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This week: {stats.overview.completedThisWeek}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Flame className="w-5 h-5" />
              <span className="text-xs font-medium">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.streaks.current} <span className="text-sm font-normal text-gray-500">days</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Best: {stats.streaks.longest} days
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Workout Plans</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overview.totalPlans}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Completed: {stats.overview.completedPlans}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-medium">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.overview.totalExercisesAssigned > 0
                ? Math.round((stats.overview.totalExercisesCompleted / stats.overview.totalExercisesAssigned) * 100)
                : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.overview.totalExercisesCompleted}/{stats.overview.totalExercisesAssigned}
            </div>
          </div>
        </div>
      )}

      {/* Top Exercises & Body Parts */}
      {stats && (stats.topExercises.length > 0 || stats.topBodyParts.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {stats.topExercises.length > 0 && (
            <div className="card">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Top Exercises</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {stats.topExercises.map((exercise, index) => (
                  <div key={exercise.exercise_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate max-w-[150px]">
                        {exercise.title}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {exercise.times_completed}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topBodyParts.length > 0 && (
            <div className="card">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Most Worked</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {stats.topBodyParts.map((bodyPart) => {
                  const maxCount = stats.topBodyParts[0]?.times_worked || 1;
                  const percentage = (bodyPart.times_worked / maxCount) * 100;
                  return (
                    <div key={bodyPart.body_part}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{bodyPart.body_part}</span>
                        <span className="text-gray-500">{bodyPart.times_worked}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout History */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Workout History</h3>
          <button
            onClick={() => setShowCancelled(!showCancelled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showCancelled
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={showCancelled ? 'Hide cancelled plans' : 'Show cancelled plans'}
          >
            {showCancelled ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Cancelled</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Cancelled</span>
              </>
            )}
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No workout history yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete some workouts to see them here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((plan) => (
              <button
                key={plan.id}
                onClick={() => navigate(`/?planId=${plan.id}`)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      Week of {formatDate(plan.weekStartDate)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{plan.workoutDays}-day split</span>
                    <span>{plan.completedExercises}/{plan.totalExercises} exercises</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                    <div
                      className={`h-full transition-all ${
                        plan.completionPercent === 100 ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${plan.completionPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`text-lg font-bold ${
                    plan.completionPercent === 100 ? 'text-green-500' : 'text-gray-700'
                  }`}>
                    {plan.completionPercent}%
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Load More */}
        {history.length < pagination.total && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                `Load More (${history.length} of ${pagination.total})`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
