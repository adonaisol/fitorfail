import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { all, get } from '../config/database.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/stats - Get user statistics
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Total workouts (exclude cancelled plans from stats)
    const workoutStats = get<{ total_plans: number; active_plans: number; completed_plans: number }>(
      `SELECT
        COUNT(*) as total_plans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_plans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_plans
       FROM workout_plans WHERE user_id = ? AND status != 'cancelled'`,
      [userId]
    );

    // Total exercises completed (exclude cancelled plans)
    const exerciseStats = get<{ total_completed: number; total_exercises: number }>(
      `SELECT
        COUNT(CASE WHEN se.completed = 1 THEN 1 END) as total_completed,
        COUNT(*) as total_exercises
       FROM session_exercises se
       JOIN workout_sessions ws ON se.session_id = ws.id
       JOIN workout_plans wp ON ws.plan_id = wp.id
       WHERE wp.user_id = ? AND wp.status != 'cancelled'`,
      [userId]
    );

    // Exercises completed this week
    const weeklyStats = get<{ completed_this_week: number }>(
      `SELECT COUNT(*) as completed_this_week
       FROM exercise_history
       WHERE user_id = ? AND completed_at >= date('now', 'weekday 0', '-7 days')`,
      [userId]
    );

    // Calculate streak (consecutive days with at least one completed exercise)
    const completionDays = all<{ date: string }>(
      `SELECT DISTINCT date(completed_at) as date
       FROM exercise_history
       WHERE user_id = ?
       ORDER BY date DESC`,
      [userId]
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (completionDays.length > 0) {
      const dates = completionDays.map(d => new Date(d.date));

      // Check if there's activity today or yesterday to count current streak
      const mostRecentDate = dates[0];
      const daysSinceLastActivity = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastActivity <= 1) {
        // Count current streak
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const dayDiff = Math.floor((dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const dayDiff = Math.floor((dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    }

    // Most frequent exercises
    const topExercises = all<{ exercise_id: number; title: string; times_completed: number }>(
      `SELECT e.id as exercise_id, e.title, COUNT(*) as times_completed
       FROM exercise_history eh
       JOIN exercises e ON eh.exercise_id = e.id
       WHERE eh.user_id = ?
       GROUP BY e.id, e.title
       ORDER BY times_completed DESC
       LIMIT 5`,
      [userId]
    );

    // Most worked body parts
    const topBodyParts = all<{ body_part: string; times_worked: number }>(
      `SELECT e.body_part, COUNT(*) as times_worked
       FROM exercise_history eh
       JOIN exercises e ON eh.exercise_id = e.id
       WHERE eh.user_id = ? AND e.body_part IS NOT NULL
       GROUP BY e.body_part
       ORDER BY times_worked DESC
       LIMIT 5`,
      [userId]
    );

    // Recent activity (last 7 days)
    const recentActivity = all<{ date: string; exercises_completed: number }>(
      `SELECT date(completed_at) as date, COUNT(*) as exercises_completed
       FROM exercise_history
       WHERE user_id = ? AND completed_at >= date('now', '-7 days')
       GROUP BY date(completed_at)
       ORDER BY date DESC`,
      [userId]
    );

    res.json({
      overview: {
        totalPlans: workoutStats?.total_plans || 0,
        activePlans: workoutStats?.active_plans || 0,
        completedPlans: workoutStats?.completed_plans || 0,
        totalExercisesCompleted: exerciseStats?.total_completed || 0,
        totalExercisesAssigned: exerciseStats?.total_exercises || 0,
        completedThisWeek: weeklyStats?.completed_this_week || 0
      },
      streaks: {
        current: currentStreak,
        longest: longestStreak
      },
      topExercises,
      topBodyParts,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/stats/history - Get detailed workout history with completion stats
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeCancelled = req.query.includeCancelled === 'true';

    // Build status filter
    const statusFilter = includeCancelled ? '' : "AND wp.status != 'cancelled'";

    // Get plans with completion stats
    const plans = all<{
      id: number;
      week_start_date: string;
      workout_days: number;
      status: string;
      created_at: string;
      total_exercises: number;
      completed_exercises: number;
    }>(
      `SELECT
        wp.id, wp.week_start_date, wp.workout_days, wp.status, wp.created_at,
        COUNT(se.id) as total_exercises,
        SUM(CASE WHEN se.completed = 1 THEN 1 ELSE 0 END) as completed_exercises
       FROM workout_plans wp
       LEFT JOIN workout_sessions ws ON wp.id = ws.plan_id
       LEFT JOIN session_exercises se ON ws.id = se.session_id
       WHERE wp.user_id = ? ${statusFilter}
       GROUP BY wp.id
       ORDER BY wp.week_start_date DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const countResult = get<{ total: number }>(
      `SELECT COUNT(*) as total FROM workout_plans wp WHERE wp.user_id = ? ${statusFilter}`,
      [userId]
    );

    // Transform to include completion percentage
    const enrichedPlans = plans.map(plan => ({
      id: plan.id,
      weekStartDate: plan.week_start_date,
      workoutDays: plan.workout_days,
      status: plan.status,
      createdAt: plan.created_at,
      totalExercises: plan.total_exercises,
      completedExercises: plan.completed_exercises,
      completionPercent: plan.total_exercises > 0
        ? Math.round((plan.completed_exercises / plan.total_exercises) * 100)
        : 0
    }));

    res.json({
      plans: enrichedPlans,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    res.status(500).json({ error: 'Failed to fetch workout history' });
  }
});

export default router;
