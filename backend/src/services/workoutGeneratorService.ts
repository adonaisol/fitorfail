import { all, get, run } from '../config/database.js';

// Types
interface Exercise {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  body_part: string | null;
  equipment: string | null;
  level: string | null;
  rating: number | null;
}

interface UserPreferences {
  workout_days: number;
  preferred_equipment: string | null;
  avoided_body_parts: string | null;
}

interface UserContext {
  id: number;
  skillLevel: string;
  preferences: UserPreferences;
  recentExerciseIds: number[];
  userRatings: Map<number, number>;
}

interface ScoredExercise extends Exercise {
  score: number;
}

interface DayPlan {
  dayNumber: number;
  dayName: string;
  focusBodyParts: string[];
  exercises: Exercise[];
}

interface GeneratedPlan {
  planId: number;
  weekStartDate: string;
  workoutDays: number;
  status: string;
  days: DayPlan[];
}

// Split strategies for different workout day configurations
const SPLIT_STRATEGIES = {
  3: [
    {
      dayNumber: 1,
      dayName: 'Full Body A - Push Focus',
      bodyParts: ['Chest', 'Shoulders', 'Triceps', 'Quadriceps'],
      exerciseCount: 6
    },
    {
      dayNumber: 2,
      dayName: 'Full Body B - Pull Focus',
      bodyParts: ['Lats', 'Middle Back', 'Biceps', 'Hamstrings'],
      exerciseCount: 6
    },
    {
      dayNumber: 3,
      dayName: 'Full Body C - Legs & Core',
      bodyParts: ['Quadriceps', 'Glutes', 'Calves', 'Abdominals'],
      exerciseCount: 6
    }
  ],
  4: [
    {
      dayNumber: 1,
      dayName: 'Upper Push',
      bodyParts: ['Chest', 'Shoulders', 'Triceps'],
      exerciseCount: 6
    },
    {
      dayNumber: 2,
      dayName: 'Lower Body',
      bodyParts: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
      exerciseCount: 7
    },
    {
      dayNumber: 3,
      dayName: 'Upper Pull',
      bodyParts: ['Lats', 'Middle Back', 'Traps', 'Biceps'],
      exerciseCount: 6
    },
    {
      dayNumber: 4,
      dayName: 'Lower Body & Core',
      bodyParts: ['Quadriceps', 'Hamstrings', 'Glutes', 'Abdominals'],
      exerciseCount: 7
    }
  ],
  5: [
    {
      dayNumber: 1,
      dayName: 'Push Day',
      bodyParts: ['Chest', 'Shoulders', 'Triceps'],
      exerciseCount: 7
    },
    {
      dayNumber: 2,
      dayName: 'Pull Day',
      bodyParts: ['Lats', 'Middle Back', 'Traps', 'Biceps'],
      exerciseCount: 7
    },
    {
      dayNumber: 3,
      dayName: 'Legs',
      bodyParts: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
      exerciseCount: 7
    },
    {
      dayNumber: 4,
      dayName: 'Arms & Core',
      bodyParts: ['Biceps', 'Triceps', 'Forearms', 'Abdominals'],
      exerciseCount: 6
    },
    {
      dayNumber: 5,
      dayName: 'Shoulders & Back',
      bodyParts: ['Shoulders', 'Lats', 'Middle Back', 'Lower Back'],
      exerciseCount: 6
    }
  ]
};

/**
 * Load user context for workout generation
 */
function loadUserContext(userId: number): UserContext {
  // Get user info
  const user = get<{ id: number; skill_level: string }>(
    'SELECT id, skill_level FROM users WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Get preferences
  const preferences = get<UserPreferences>(
    'SELECT workout_days, preferred_equipment, avoided_body_parts FROM user_preferences WHERE user_id = ?',
    [userId]
  ) || { workout_days: 3, preferred_equipment: null, avoided_body_parts: null };

  // Get recent exercises (last 7 days)
  const recentExercises = all<{ exercise_id: number }>(
    `SELECT DISTINCT exercise_id FROM exercise_history
     WHERE user_id = ? AND completed_at > datetime('now', '-7 days')`,
    [userId]
  );

  // Get user ratings
  const ratings = all<{ exercise_id: number; rating: number }>(
    'SELECT exercise_id, rating FROM user_exercise_ratings WHERE user_id = ?',
    [userId]
  );

  const userRatings = new Map<number, number>();
  for (const r of ratings) {
    userRatings.set(r.exercise_id, r.rating);
  }

  return {
    id: userId,
    skillLevel: user.skill_level,
    preferences,
    recentExerciseIds: recentExercises.map(e => e.exercise_id),
    userRatings
  };
}

/**
 * Score an exercise for a user
 * Higher score = better match
 */
function scoreExercise(exercise: Exercise, context: UserContext): number {
  let score = 0;

  // Rating score (user rating or dataset rating) - max 100 points
  const userRating = context.userRatings.get(exercise.id);
  const rating = userRating ?? exercise.rating ?? 3;
  score += rating * 20;

  // Skill level match - 30 points for exact match
  if (exercise.level === context.skillLevel) {
    score += 30;
  } else if (
    (context.skillLevel === 'Intermediate' && exercise.level === 'Beginner') ||
    (context.skillLevel === 'Expert' && exercise.level === 'Intermediate')
  ) {
    // Adjacent level is okay
    score += 15;
  }

  // Equipment preference - 20 points for preferred equipment
  if (context.preferences.preferred_equipment) {
    const preferred = context.preferences.preferred_equipment.split(',').map(e => e.trim());
    if (preferred.includes(exercise.equipment || '')) {
      score += 20;
    }
  } else {
    // No preference set, give points to common equipment
    const commonEquipment = ['Body Only', 'Dumbbell', 'Barbell', 'Cable', 'Machine'];
    if (commonEquipment.includes(exercise.equipment || '')) {
      score += 15;
    }
  }

  // Recency penalty - reduce score for recently used exercises
  if (context.recentExerciseIds.includes(exercise.id)) {
    score -= 50;
  }

  // Exercise type bonus - prefer Strength exercises
  if (exercise.type === 'Strength') {
    score += 10;
  } else if (exercise.type === 'Powerlifting' || exercise.type === 'Olympic Weightlifting') {
    score += 5;
  }

  // Random factor for variety (0-15)
  score += Math.random() * 15;

  return score;
}

/**
 * Select exercises for a specific body part group
 */
function selectExercises(
  bodyParts: string[],
  count: number,
  context: UserContext,
  usedExerciseIds: Set<number>
): Exercise[] {
  // Get avoided body parts
  const avoidedParts = context.preferences.avoided_body_parts
    ? context.preferences.avoided_body_parts.split(',').map(p => p.trim())
    : [];

  // Filter out avoided body parts
  const targetBodyParts = bodyParts.filter(bp => !avoidedParts.includes(bp));

  if (targetBodyParts.length === 0) {
    return [];
  }

  const targetPlaceholders = targetBodyParts.map(() => '?').join(',');

  // Get candidate exercises
  const candidates = all<Exercise>(
    `SELECT id, title, description, type, body_part, equipment, level, rating
     FROM exercises
     WHERE body_part IN (${targetPlaceholders})
     AND type IN ('Strength', 'Powerlifting', 'Olympic Weightlifting', 'Plyometrics')`,
    targetBodyParts
  );

  // Score and sort exercises
  const scored: ScoredExercise[] = candidates
    .filter(e => !usedExerciseIds.has(e.id))
    .map(exercise => ({
      ...exercise,
      score: scoreExercise(exercise, context)
    }))
    .sort((a, b) => b.score - a.score);

  // Select top exercises, ensuring variety in body parts
  const selected: Exercise[] = [];
  const bodyPartCounts = new Map<string, number>();

  for (const exercise of scored) {
    if (selected.length >= count) break;

    const bodyPart = exercise.body_part || 'Unknown';
    const currentCount = bodyPartCounts.get(bodyPart) || 0;

    // Limit exercises per body part to ensure variety
    const maxPerBodyPart = Math.ceil(count / targetBodyParts.length) + 1;
    if (currentCount < maxPerBodyPart) {
      selected.push(exercise);
      bodyPartCounts.set(bodyPart, currentCount + 1);
      usedExerciseIds.add(exercise.id);
    }
  }

  return selected;
}

/**
 * Generate a weekly workout plan for a user
 */
export function generateWorkoutPlan(userId: number, workoutDays?: number): GeneratedPlan {
  // Load user context
  const context = loadUserContext(userId);

  // Use specified days or user preference
  const days = workoutDays || context.preferences.workout_days;

  if (![3, 4, 5].includes(days)) {
    throw new Error('Workout days must be 3, 4, or 5');
  }

  // Get split strategy
  const strategy = SPLIT_STRATEGIES[days as 3 | 4 | 5];

  // Calculate week start date (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysToMonday);
  const weekStartDate = weekStart.toISOString().split('T')[0];

  // Create workout plan
  const planResult = run(
    `INSERT INTO workout_plans (user_id, week_start_date, workout_days, status)
     VALUES (?, ?, ?, 'draft')`,
    [userId, weekStartDate, days]
  );

  const planId = planResult.lastInsertRowid!;

  // Track used exercises across all days
  const usedExerciseIds = new Set<number>();

  // Generate sessions for each day
  const dayPlans: DayPlan[] = [];

  for (const dayStrategy of strategy) {
    // Select exercises for this day
    const exercises = selectExercises(
      dayStrategy.bodyParts,
      dayStrategy.exerciseCount,
      context,
      usedExerciseIds
    );

    // Create session
    const sessionResult = run(
      `INSERT INTO workout_sessions (plan_id, day_number, day_name, focus_body_parts)
       VALUES (?, ?, ?, ?)`,
      [planId, dayStrategy.dayNumber, dayStrategy.dayName, dayStrategy.bodyParts.join(', ')]
    );

    const sessionId = sessionResult.lastInsertRowid!;

    // Add exercises to session
    exercises.forEach((exercise, index) => {
      // Determine sets and reps based on exercise type
      let sets = 3;
      let reps = '8-12';

      if (exercise.type === 'Powerlifting') {
        sets = 5;
        reps = '3-5';
      } else if (exercise.type === 'Plyometrics') {
        sets = 3;
        reps = '10-15';
      } else if (exercise.body_part === 'Abdominals') {
        sets = 3;
        reps = '15-20';
      }

      run(
        `INSERT INTO session_exercises (session_id, exercise_id, order_index, sets, reps)
         VALUES (?, ?, ?, ?, ?)`,
        [sessionId, exercise.id, index + 1, sets, reps]
      );
    });

    dayPlans.push({
      dayNumber: dayStrategy.dayNumber,
      dayName: dayStrategy.dayName,
      focusBodyParts: dayStrategy.bodyParts,
      exercises
    });
  }

  return {
    planId,
    weekStartDate,
    workoutDays: days,
    status: 'draft',
    days: dayPlans
  };
}

/**
 * Get a workout plan with all sessions and exercises
 */
export function getWorkoutPlan(planId: number, userId: number): GeneratedPlan | null {
  // Get plan
  const plan = get<{
    id: number;
    user_id: number;
    week_start_date: string;
    workout_days: number;
    status: string;
  }>('SELECT * FROM workout_plans WHERE id = ? AND user_id = ?', [planId, userId]);

  if (!plan) {
    return null;
  }

  // Get sessions
  const sessions = all<{
    id: number;
    day_number: number;
    day_name: string;
    focus_body_parts: string;
  }>('SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY day_number', [planId]);

  const dayPlans: DayPlan[] = [];

  for (const session of sessions) {
    // Get exercises for this session
    const sessionExercises = all<{
      id: number;
      exercise_id: number;
      order_index: number;
      sets: number;
      reps: string;
      completed: number;
    }>('SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index', [session.id]);

    const exercises: (Exercise & { sessionExerciseId: number; sets: number; reps: string; completed: boolean })[] = [];

    for (const se of sessionExercises) {
      const exercise = get<Exercise>(
        'SELECT id, title, description, type, body_part, equipment, level, rating FROM exercises WHERE id = ?',
        [se.exercise_id]
      );

      if (exercise) {
        exercises.push({
          ...exercise,
          sessionExerciseId: se.id,
          sets: se.sets,
          reps: se.reps,
          completed: se.completed === 1
        });
      }
    }

    dayPlans.push({
      dayNumber: session.day_number,
      dayName: session.day_name,
      focusBodyParts: session.focus_body_parts.split(', '),
      exercises
    });
  }

  return {
    planId: plan.id,
    weekStartDate: plan.week_start_date,
    workoutDays: plan.workout_days,
    status: plan.status,
    days: dayPlans
  };
}

/**
 * Get the current active plan for a user
 */
export function getCurrentPlan(userId: number): GeneratedPlan | null {
  const plan = get<{ id: number }>(
    `SELECT id FROM workout_plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY week_start_date DESC LIMIT 1`,
    [userId]
  );

  if (!plan) {
    return null;
  }

  return getWorkoutPlan(plan.id, userId);
}

/**
 * Activate a draft plan
 */
export function activatePlan(planId: number, userId: number): boolean {
  // Deactivate any existing active plans
  run(
    `UPDATE workout_plans SET status = 'completed'
     WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  // Activate the new plan
  run(
    `UPDATE workout_plans SET status = 'active'
     WHERE id = ? AND user_id = ? AND status = 'draft'`,
    [planId, userId]
  );

  return true;
}

/**
 * Refresh a single day in a plan
 */
export function refreshDay(planId: number, dayNumber: number, userId: number): DayPlan | null {
  // Verify ownership
  const plan = get<{ id: number; workout_days: number }>(
    'SELECT id, workout_days FROM workout_plans WHERE id = ? AND user_id = ?',
    [planId, userId]
  );

  if (!plan) {
    return null;
  }

  // Get the session
  const session = get<{ id: number; day_name: string; focus_body_parts: string }>(
    'SELECT id, day_name, focus_body_parts FROM workout_sessions WHERE plan_id = ? AND day_number = ?',
    [planId, dayNumber]
  );

  if (!session) {
    return null;
  }

  // Delete existing exercises
  run('DELETE FROM session_exercises WHERE session_id = ?', [session.id]);

  // Load user context
  const context = loadUserContext(userId);

  // Get currently used exercises in other days
  const usedExercises = all<{ exercise_id: number }>(
    `SELECT se.exercise_id FROM session_exercises se
     JOIN workout_sessions ws ON se.session_id = ws.id
     WHERE ws.plan_id = ? AND ws.day_number != ?`,
    [planId, dayNumber]
  );
  const usedExerciseIds = new Set(usedExercises.map(e => e.exercise_id));

  // Get strategy for this day
  const strategy = SPLIT_STRATEGIES[plan.workout_days as 3 | 4 | 5];
  const dayStrategy = strategy.find(d => d.dayNumber === dayNumber);

  if (!dayStrategy) {
    return null;
  }

  // Select new exercises
  const exercises = selectExercises(
    dayStrategy.bodyParts,
    dayStrategy.exerciseCount,
    context,
    usedExerciseIds
  );

  // Add exercises to session
  exercises.forEach((exercise, index) => {
    let sets = 3;
    let reps = '8-12';

    if (exercise.type === 'Powerlifting') {
      sets = 5;
      reps = '3-5';
    } else if (exercise.type === 'Plyometrics') {
      sets = 3;
      reps = '10-15';
    } else if (exercise.body_part === 'Abdominals') {
      sets = 3;
      reps = '15-20';
    }

    run(
      `INSERT INTO session_exercises (session_id, exercise_id, order_index, sets, reps)
       VALUES (?, ?, ?, ?, ?)`,
      [session.id, exercise.id, index + 1, sets, reps]
    );
  });

  return {
    dayNumber,
    dayName: session.day_name,
    focusBodyParts: session.focus_body_parts.split(', '),
    exercises
  };
}

/**
 * Mark an exercise as completed
 */
export function completeExercise(
  sessionExerciseId: number,
  userId: number,
  setsCompleted?: number
): boolean {
  // Verify ownership
  const sessionExercise = get<{ id: number; exercise_id: number; session_id: number }>(
    `SELECT se.id, se.exercise_id, se.session_id
     FROM session_exercises se
     JOIN workout_sessions ws ON se.session_id = ws.id
     JOIN workout_plans wp ON ws.plan_id = wp.id
     WHERE se.id = ? AND wp.user_id = ?`,
    [sessionExerciseId, userId]
  );

  if (!sessionExercise) {
    return false;
  }

  // Mark as completed
  run(
    `UPDATE session_exercises SET completed = 1, completed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [sessionExerciseId]
  );

  // Add to history
  run(
    `INSERT INTO exercise_history (user_id, exercise_id, session_exercise_id, sets_completed)
     VALUES (?, ?, ?, ?)`,
    [userId, sessionExercise.exercise_id, sessionExerciseId, setsCompleted || null]
  );

  return true;
}

export default {
  generateWorkoutPlan,
  getWorkoutPlan,
  getCurrentPlan,
  activatePlan,
  refreshDay,
  completeExercise
};
