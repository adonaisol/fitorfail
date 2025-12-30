import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Loader2, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkout } from '../contexts/WorkoutContext';
import { workoutApi } from '../services/api';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { WorkoutPlan, ActivePlanInfo } from '../types';

type WorkoutDays = 3 | 4 | 5;

const SPLIT_OPTIONS: { days: WorkoutDays; name: string; description: string }[] = [
  {
    days: 3,
    name: '3-Day Split',
    description: 'Full body workouts, great for beginners or busy schedules'
  },
  {
    days: 4,
    name: '4-Day Split',
    description: 'Upper/Lower split for balanced muscle development'
  },
  {
    days: 5,
    name: '5-Day Split',
    description: 'Push/Pull/Legs for advanced training'
  }
];

export default function GeneratePage(): JSX.Element {
  const navigate = useNavigate();
  const { generatePlan, activatePlan, isLoading } = useWorkout();

  const [selectedDays, setSelectedDays] = useState<WorkoutDays>(3);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'activating'>('select');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activePlanInfo, setActivePlanInfo] = useState<ActivePlanInfo | null>(null);

  const handleGenerate = async () => {
    setError(null);
    try {
      const plan = await generatePlan(selectedDays);
      setGeneratedPlan(plan);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    }
  };

  const handleActivateClick = async () => {
    if (!generatedPlan) return;

    // Check if there's an active plan
    try {
      const { activePlan } = await workoutApi.getActivePlanInfo();
      if (activePlan) {
        setActivePlanInfo(activePlan);
        setShowCancelConfirm(true);
        return;
      }
    } catch {
      // If we can't check, proceed anyway
    }

    // No active plan, proceed directly
    await doActivate();
  };

  const doActivate = async () => {
    if (!generatedPlan) return;
    setShowCancelConfirm(false);
    setStep('activating');
    setError(null);
    try {
      await activatePlan(generatedPlan.planId);
      toast.success('Workout plan activated!');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate plan');
      toast.error('Failed to activate plan');
      setStep('preview');
    }
  };

  const handleRegenerate = async () => {
    setGeneratedPlan(null);
    setStep('select');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Generate Workout Plan</h1>
        <p className="text-gray-600 mt-1">
          Create a personalized weekly workout plan based on your fitness level
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {step === 'select' && (
        <>
          {/* Split selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-gray-700">
              Choose your workout split
            </label>
            {SPLIT_OPTIONS.map((option) => (
              <button
                key={option.days}
                onClick={() => setSelectedDays(option.days)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedDays === option.days
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{option.description}</p>
                  </div>
                  {selectedDays === option.days && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Dumbbell className="w-5 h-5" />
                Generate {selectedDays}-Day Plan
              </>
            )}
          </button>
        </>
      )}

      {step === 'preview' && generatedPlan && (
        <>
          {/* Plan preview */}
          <div className="card mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Plan Preview</h2>
              <p className="text-sm text-gray-600">
                {generatedPlan.workoutDays}-day split starting {generatedPlan.weekStartDate}
              </p>
            </div>
            <div className="p-4 space-y-4">
              {generatedPlan.days.map((day) => (
                <div key={day.dayNumber} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {day.dayNumber}
                    </span>
                    <h3 className="font-medium text-gray-900">{day.dayName}</h3>
                  </div>
                  <div className="ml-8 space-y-1">
                    {day.exercises.map((exercise, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        <span>{exercise.title}</span>
                        <span className="text-gray-400">
                          {exercise.sets}x{exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              Regenerate
            </button>
            <button
              onClick={handleActivateClick}
              disabled={isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Activate Plan
                </>
              )}
            </button>
          </div>
        </>
      )}

      {step === 'activating' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="mt-2 text-gray-600">Activating your workout plan...</p>
        </div>
      )}

      {/* Cancel active plan confirmation dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Current Plan?"
        message={activePlanInfo
          ? `You have an active plan for the week of ${formatDate(activePlanInfo.weekStartDate)} with ${activePlanInfo.completedExercises}/${activePlanInfo.totalExercises} exercises completed. Activating this new plan will cancel your current plan.`
          : 'You have an active workout plan. Activating this new plan will cancel your current plan.'
        }
        variant="warning"
        onCancel={() => setShowCancelConfirm(false)}
        actions={[
          {
            label: 'Cancel Current & Activate New',
            variant: 'warning',
            onClick: doActivate
          }
        ]}
        cancelLabel="Keep Current Plan"
      />
    </div>
  );
}
