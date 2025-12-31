import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Dumbbell, Loader2, Check, X, HelpCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { preferencesApi, getErrorMessage } from '../services/api';
import type { PreferencesOptions } from '../types';

type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert';

export default function ProfilePage(): JSX.Element {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<PreferencesOptions | null>(null);

  // Form state
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(user?.skillLevel || 'Beginner');
  const [workoutDays, setWorkoutDays] = useState<3 | 4 | 5>(3);
  const [preferredEquipment, setPreferredEquipment] = useState<string[]>([]);
  const [avoidedBodyParts, setAvoidedBodyParts] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profile, opts] = await Promise.all([
        preferencesApi.get(),
        preferencesApi.getOptions()
      ]);

      setSkillLevel(profile.user.skillLevel);
      setWorkoutDays(profile.preferences.workoutDays);
      setPreferredEquipment(profile.preferences.preferredEquipment);
      setAvoidedBodyParts(profile.preferences.avoidedBodyParts);
      setOptions(opts);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await preferencesApi.update({
        skillLevel,
        workoutDays,
        preferredEquipment,
        avoidedBodyParts
      });

      // Update auth context with new user info
      if (updateUser && result.user) {
        updateUser({
          ...user!,
          skillLevel: result.user.skillLevel as SkillLevel
        });
      }

      toast.success('Preferences saved!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEquipment = (item: string) => {
    setPreferredEquipment(prev =>
      prev.includes(item)
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };

  const toggleBodyPart = (item: string) => {
    setAvoidedBodyParts(prev =>
      prev.includes(item)
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-1">Customize your workout preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{user?.username}</h2>
              <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <Link
          to="/home/help"
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Help & Guide</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Settings Section */}
      <div className="space-y-6">
        {/* Skill Level */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Fitness Level</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              Your skill level affects exercise selection and difficulty
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Expert'] as SkillLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-center ${
                    skillLevel === level
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workout Days */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Workout Split</h3>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              How many days per week do you want to work out?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([3, 4, 5] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setWorkoutDays(days)}
                  className={`px-4 py-3 rounded-lg text-center transition-colors ${
                    workoutDays === days
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg font-bold">{days}</div>
                  <div className="text-xs opacity-80">days</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred Equipment */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Preferred Equipment</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Select equipment you have access to (optional)
            </p>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {options?.equipment.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleEquipment(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    preferredEquipment.includes(item)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preferredEquipment.includes(item) && <Check className="w-3 h-3" />}
                  {item}
                </button>
              ))}
            </div>
            {preferredEquipment.length > 0 && (
              <button
                onClick={() => setPreferredEquipment([])}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Avoided Body Parts */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Avoided Body Parts</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Skip exercises targeting these areas (e.g., due to injury)
            </p>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {options?.bodyParts.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleBodyPart(item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    avoidedBodyParts.includes(item)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {avoidedBodyParts.includes(item) && <X className="w-3 h-3" />}
                  {item}
                </button>
              ))}
            </div>
            {avoidedBodyParts.length > 0 && (
              <button
                onClick={() => setAvoidedBodyParts([])}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 md:relative md:bottom-auto md:border-0 md:bg-transparent md:p-0 md:mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
