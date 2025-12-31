import { Link, Navigate } from 'react-router-dom';
import { Dumbbell, Zap, RefreshCw, Star, BarChart3, ChevronRight, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage(): JSX.Element {
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <Dumbbell className="w-12 h-12 text-primary-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">FitOrFail</span>
          </div>
          <Link
            to="/login"
            className="text-gray-600 hover:text-primary-500 font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Personal Workout
              <span className="text-primary-500"> Generator</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Get personalized weekly workout plans tailored to your fitness level,
              equipment, and preferences. Choose from nearly 3,000 exercises.
            </p>
            <div className="flex flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                to="/register"
                className="btn-primary flex-1 text-base sm:text-lg px-4 sm:px-8 py-3 flex items-center justify-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 px-4 sm:px-8 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 sm:mt-20 flex flex-wrap justify-center gap-3 sm:gap-6">
            <FeatureCard
              icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Skill-Based"
              description="Exercises matched to your fitness level"
              color="text-green-500"
              bgColor="bg-green-100"
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Smart Generation"
              description="AI-powered algorithm creates balanced workout splits"
              color="text-yellow-500"
              bgColor="bg-yellow-100"
            />
            <FeatureCard
              icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Flexible Refresh"
              description="Refresh individual exercises or entire workout days"
              color="text-blue-500"
              bgColor="bg-blue-100"
            />
            <FeatureCard
              icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Personal Ratings"
              description="Rate exercises to personalize future workouts"
              color="text-orange-500"
              bgColor="bg-orange-100"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Track Progress"
              description="Monitor your workout history and streaks"
              color="text-purple-500"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Workout Splits */}
          <div className="mt-16 sm:mt-20 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Choose Your Split
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Select from 3, 4, or 5-day workout splits designed to maximize your results
            </p>
            <div className="relative md:static overflow-hidden md:overflow-visible">
              {/* Left shadow indicator */}
              <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden" />
              {/* Right shadow indicator */}
              <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />

              <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-auto md:px-0">
                <SplitCard
                  days={3}
                  title="Full Body"
                  description="Perfect for beginners or busy schedules"
                  workouts={['Push Focus', 'Pull Focus', 'Legs & Core']}
                  difficulty="easy"
                />
                <SplitCard
                  days={4}
                  title="Upper/Lower"
                  description="Balanced approach for intermediate lifters"
                  workouts={['Upper Push', 'Lower Body', 'Upper Pull', 'Lower & Core']}
                  difficulty="medium"
                />
                <SplitCard
                  days={5}
                  title="PPL+"
                  description="Advanced split for serious training"
                  workouts={['Push', 'Pull', 'Legs', 'Arms', 'Shoulders']}
                  difficulty="hard"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 sm:mt-20 text-center bg-primary-500 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-primary-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-xl mx-auto">
              Join FitOrFail and get your first personalized workout plan in seconds.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Create Free Account
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>FitOrFail - Your Personal Workout Generator</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

function FeatureCard({ icon, title, description, color, bgColor }: FeatureCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(20%-19.2px)]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} ${color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
    </div>
  );
}

interface SplitCardProps {
  days: number;
  title: string;
  description: string;
  workouts: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyStyles = {
  easy: {
    bg: 'bg-emerald-50 border-emerald-200',
    accent: 'text-emerald-600',
    muted: 'text-emerald-600/70',
  },
  medium: {
    bg: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-600',
    muted: 'text-amber-600/70',
  },
  hard: {
    bg: 'bg-red-50 border-red-200',
    accent: 'text-red-700',
    muted: 'text-red-700/70',
  },
};

function SplitCard({ days, title, description, workouts, difficulty }: SplitCardProps): JSX.Element {
  const styles = difficultyStyles[difficulty];

  return (
    <div className={`rounded-xl p-4 sm:p-6 flex-shrink-0 w-[200px] sm:w-[240px] md:w-auto snap-center border ${styles.bg}`}>
      <div className={`text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1 ${styles.accent}`}>
        {days}
      </div>
      <div className={`text-xs sm:text-sm mb-1.5 sm:mb-2 ${styles.muted}`}>
        days/week
      </div>
      <h3 className="font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 text-gray-900">
        {title}
      </h3>
      <p className="text-xs sm:text-sm mb-2 sm:mb-4 text-gray-600">
        {description}
      </p>
      <ul className={`text-xs sm:text-sm space-y-0.5 sm:space-y-1 text-left ${styles.muted}`}>
        {workouts.map((workout, i) => (
          <li key={i}>Day {i + 1}: {workout}</li>
        ))}
      </ul>
    </div>
  );
}
