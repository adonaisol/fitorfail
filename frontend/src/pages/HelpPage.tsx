import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Dumbbell,
  RefreshCw,
  Star,
  History,
  BarChart3,
  Flame,
  Settings,
  Plus,
  Check,
  ChevronRight,
  Calendar,
  Sparkles,
  Target
} from 'lucide-react';

interface HelpSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function HelpSection({ icon, title, children }: HelpSectionProps): JSX.Element {
  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-4 text-gray-600 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function HelpPage(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900">Help & Guide</h1>
        </div>
        <p className="text-gray-600">Learn how to use FitOrFail effectively</p>
      </div>

      <div className="space-y-4">
        {/* Getting Started */}
        <HelpSection
          icon={<Sparkles className="w-5 h-5 text-primary-500" />}
          title="Getting Started"
        >
          <p>
            FitOrFail generates personalized weekly workout plans based on your fitness level,
            available equipment, and preferences. Each plan contains carefully selected exercises
            from a database of nearly 3,000 exercises.
          </p>
          <div className="bg-primary-50 rounded-lg p-3 mt-2">
            <p className="text-primary-700 font-medium text-sm">Quick Start:</p>
            <ol className="list-decimal list-inside mt-1 text-primary-600 space-y-1">
              <li>Set your preferences in <Link to="/home/profile" className="underline">Profile</Link></li>
              <li>Generate a workout plan</li>
              <li>Complete exercises and track your progress</li>
            </ol>
          </div>
        </HelpSection>

        {/* Generating Workouts */}
        <HelpSection
          icon={<Plus className="w-5 h-5 text-green-500" />}
          title="Generating Workout Plans"
        >
          <p>
            To create a new workout plan, go to the <strong>Generate</strong> page from the bottom
            navigation. You can choose between 3, 4, or 5-day workout splits:
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium shrink-0">3-Day</span>
              <span>Full body workouts with different focus areas each day</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium shrink-0">4-Day</span>
              <span>Upper/Lower split for balanced training</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium shrink-0">5-Day</span>
              <span>Push/Pull/Legs plus dedicated arm and shoulder days</span>
            </div>
          </div>
          <p className="mt-2">
            The algorithm considers your skill level, equipment preferences, exercise ratings,
            and recent history to select the best exercises for you.
          </p>
        </HelpSection>

        {/* Completing Exercises */}
        <HelpSection
          icon={<Check className="w-5 h-5 text-green-500" />}
          title="Completing Exercises"
        >
          <p>
            Each exercise card shows the exercise name, target muscle group, and required equipment.
            Tap an exercise to see more details including a full description.
          </p>
          <p>
            To mark an exercise as complete, tap the <strong>circle checkbox</strong> on the right
            side of the exercise card. The card will turn green and show a checkmark.
          </p>
          <p>
            You can undo a completion by tapping the checkbox again. Your progress is saved
            automatically and contributes to your stats.
          </p>
        </HelpSection>

        {/* Refreshing Workouts */}
        <HelpSection
          icon={<RefreshCw className="w-5 h-5 text-blue-500" />}
          title="Refreshing Workouts"
        >
          <p>Don't like an exercise? You have several refresh options:</p>
          <div className="mt-2 space-y-3">
            <div className="border-l-2 border-blue-300 pl-3">
              <p className="font-medium text-gray-700">Refresh Uncompleted</p>
              <p className="text-gray-500">
                Replaces only the exercises you haven't completed yet, preserving your progress.
              </p>
            </div>
            <div className="border-l-2 border-orange-300 pl-3">
              <p className="font-medium text-gray-700">Refresh Entire Day</p>
              <p className="text-gray-500">
                Generates a completely new set of exercises for that day.
              </p>
            </div>
            <div className="border-l-2 border-red-300 pl-3">
              <p className="font-medium text-gray-700">Refresh All Days</p>
              <p className="text-gray-500">
                Regenerates exercises for all incomplete days in your plan.
              </p>
            </div>
          </div>
        </HelpSection>

        {/* Rating Exercises */}
        <HelpSection
          icon={<Star className="w-5 h-5 text-yellow-500" />}
          title="Rating Exercises"
        >
          <p>
            When you expand an exercise card, you can rate it from 1-5 stars. Your ratings
            directly influence future workout generation:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Higher rated</strong> exercises appear more frequently</li>
            <li><strong>Lower rated</strong> exercises are less likely to be selected</li>
            <li>Ratings are personal and override the default dataset ratings</li>
          </ul>
          <p className="mt-2">
            Rate exercises you enjoy highly and those you dislike lower to personalize
            your future workouts.
          </p>
        </HelpSection>

        {/* History Page */}
        <HelpSection
          icon={<History className="w-5 h-5 text-purple-500" />}
          title="History Page"
        >
          <p>
            The History page shows all your past workout plans and completion records.
            You can see:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Previous workout plans with their status</li>
            <li>Which exercises you completed on each day</li>
            <li>When you completed each workout</li>
          </ul>
          <p className="mt-2">
            Use this to track your progress over time and see how consistent you've been
            with your training.
          </p>
        </HelpSection>

        {/* Stats & Streaks */}
        <HelpSection
          icon={<BarChart3 className="w-5 h-5 text-indigo-500" />}
          title="Stats & Streaks"
        >
          <p>Your dashboard displays key statistics:</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-primary-500 mb-0.5">
                <Calendar className="w-3 h-3" />
                <span className="text-xs font-medium">This Week</span>
              </div>
              <p className="text-xs text-gray-500">Workouts completed this week</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-green-500 mb-0.5">
                <Dumbbell className="w-3 h-3" />
                <span className="text-xs font-medium">Exercises</span>
              </div>
              <p className="text-xs text-gray-500">Total exercises completed</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-orange-500 mb-0.5">
                <Flame className="w-3 h-3" />
                <span className="text-xs font-medium">Streak</span>
              </div>
              <p className="text-xs text-gray-500">Consecutive days active</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-purple-500 mb-0.5">
                <Target className="w-3 h-3" />
                <span className="text-xs font-medium">Plans</span>
              </div>
              <p className="text-xs text-gray-500">Total plans generated</p>
            </div>
          </div>
          <p className="mt-3">
            <strong>Streaks</strong> are calculated based on consecutive days where you
            complete at least one exercise. Keep your streak alive by staying consistent!
          </p>
        </HelpSection>

        {/* Profile Settings */}
        <HelpSection
          icon={<Settings className="w-5 h-5 text-gray-500" />}
          title="Profile & Preferences"
        >
          <p>Customize your experience in the Profile page:</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Fitness Level</p>
                <p className="text-gray-500">Beginner, Intermediate, or Expert - affects exercise difficulty</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Workout Days</p>
                <p className="text-gray-500">Choose 3, 4, or 5-day splits</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Preferred Equipment</p>
                <p className="text-gray-500">Select equipment you have access to</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Avoided Body Parts</p>
                <p className="text-gray-500">Exclude exercises for injured or sensitive areas</p>
              </div>
            </div>
          </div>
        </HelpSection>

        {/* Tips */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Pro Tips
          </h3>
          <ul className="text-sm space-y-2 text-primary-100">
            <li>• Rate exercises as you complete them to improve future recommendations</li>
            <li>• Use "Refresh Uncompleted" to swap out exercises you can't do</li>
            <li>• Check your streak daily to maintain motivation</li>
            <li>• Update your preferences as you progress to more challenging exercises</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
