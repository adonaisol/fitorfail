import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generateWorkoutPlan,
  getWorkoutPlan,
  getCurrentPlan,
  getActivePlanInfo,
  activatePlan,
  refreshDay,
  completeExercise,
  uncompleteExercise,
  refreshUncompletedExercises,
  refreshIncompleteDays
} from '../services/workoutGeneratorService.js';
import { all, get } from '../config/database.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/workouts/generate - Generate new weekly plan
router.post('/generate', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { workoutDays } = req.body;

    const plan = generateWorkoutPlan(userId, workoutDays);

    res.status(201).json({
      message: 'Workout plan generated successfully',
      plan
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate workout plan'
    });
  }
});

// GET /api/workouts/current - Get current/active week plan
router.get('/current', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const plan = getCurrentPlan(userId);

    if (!plan) {
      res.status(404).json({ error: 'No active workout plan found' });
      return;
    }

    res.json({ plan });
  } catch (error) {
    console.error('Error fetching current plan:', error);
    res.status(500).json({ error: 'Failed to fetch current plan' });
  }
});

// GET /api/workouts/history - Get past workout plans
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const plans = all<{
      id: number;
      week_start_date: string;
      workout_days: number;
      status: string;
      created_at: string;
    }>(
      `SELECT id, week_start_date, workout_days, status, created_at
       FROM workout_plans
       WHERE user_id = ?
       ORDER BY week_start_date DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const countResult = get<{ total: number }>(
      'SELECT COUNT(*) as total FROM workout_plans WHERE user_id = ?',
      [userId]
    );

    res.json({
      plans,
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

// GET /api/workouts/active-info - Get info about current active plan (for confirmation dialog)
// NOTE: This must be defined BEFORE /:id route to avoid matching "active-info" as an id
router.get('/active-info', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const activePlan = getActivePlanInfo(userId);

    res.json({ activePlan });
  } catch (error) {
    console.error('Error fetching active plan info:', error);
    res.status(500).json({ error: 'Failed to fetch active plan info' });
  }
});

// GET /api/workouts/:id - Get specific plan details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }

    const plan = getWorkoutPlan(planId, userId);

    if (!plan) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    res.json({ plan });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ error: 'Failed to fetch workout plan' });
  }
});

// PUT /api/workouts/:id/activate - Activate a draft plan
router.put('/:id/activate', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }

    const success = activatePlan(planId, userId);

    if (!success) {
      res.status(404).json({ error: 'Plan not found or already activated' });
      return;
    }

    const plan = getWorkoutPlan(planId, userId);
    res.json({
      message: 'Plan activated successfully',
      plan
    });
  } catch (error) {
    console.error('Error activating plan:', error);
    res.status(500).json({ error: 'Failed to activate plan' });
  }
});

// POST /api/workouts/:id/refresh - Regenerate entire week
router.post('/:id/refresh', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }

    // Get the current plan to get workout days
    const currentPlan = getWorkoutPlan(planId, userId);
    if (!currentPlan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Refresh each day
    for (let day = 1; day <= currentPlan.workoutDays; day++) {
      refreshDay(planId, day, userId);
    }

    // Get updated plan
    const plan = getWorkoutPlan(planId, userId);
    res.json({
      message: 'Plan refreshed successfully',
      plan
    });
  } catch (error) {
    console.error('Error refreshing plan:', error);
    res.status(500).json({ error: 'Failed to refresh plan' });
  }
});

// POST /api/workouts/:planId/days/:dayNumber/refresh - Regenerate single day
router.post('/:planId/days/:dayNumber/refresh', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId);
    const dayNumber = parseInt(req.params.dayNumber);

    if (isNaN(planId) || isNaN(dayNumber)) {
      res.status(400).json({ error: 'Invalid plan ID or day number' });
      return;
    }

    const day = refreshDay(planId, dayNumber, userId);

    if (!day) {
      res.status(404).json({ error: 'Day not found' });
      return;
    }

    res.json({
      message: 'Day refreshed successfully',
      day
    });
  } catch (error) {
    console.error('Error refreshing day:', error);
    res.status(500).json({ error: 'Failed to refresh day' });
  }
});

// POST /api/workouts/:planId/days/:dayNumber/refresh-uncompleted - Refresh only uncompleted exercises
router.post('/:planId/days/:dayNumber/refresh-uncompleted', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId);
    const dayNumber = parseInt(req.params.dayNumber);

    if (isNaN(planId) || isNaN(dayNumber)) {
      res.status(400).json({ error: 'Invalid plan ID or day number' });
      return;
    }

    const day = refreshUncompletedExercises(planId, dayNumber, userId);

    if (!day) {
      res.status(404).json({ error: 'Day not found' });
      return;
    }

    res.json({
      message: 'Uncompleted exercises refreshed successfully',
      day
    });
  } catch (error) {
    console.error('Error refreshing uncompleted exercises:', error);
    res.status(500).json({ error: 'Failed to refresh uncompleted exercises' });
  }
});

// POST /api/workouts/:id/refresh-incomplete - Refresh only incomplete days
router.post('/:id/refresh-incomplete', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id);

    if (isNaN(planId)) {
      res.status(400).json({ error: 'Invalid plan ID' });
      return;
    }

    const result = refreshIncompleteDays(planId, userId);

    if (!result.plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    res.json({
      message: result.refreshedDays.length > 0
        ? `Refreshed ${result.refreshedDays.length} incomplete day${result.refreshedDays.length === 1 ? '' : 's'}`
        : 'All days are already complete',
      refreshedDays: result.refreshedDays,
      plan: result.plan
    });
  } catch (error) {
    console.error('Error refreshing incomplete days:', error);
    res.status(500).json({ error: 'Failed to refresh incomplete days' });
  }
});

// GET /api/workouts/sessions/:id - Get session details with exercises
router.get('/sessions/:id', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sessionId = parseInt(req.params.id);

    if (isNaN(sessionId)) {
      res.status(400).json({ error: 'Invalid session ID' });
      return;
    }

    // Get session with ownership check
    const session = get<{
      id: number;
      plan_id: number;
      day_number: number;
      day_name: string;
      focus_body_parts: string;
    }>(
      `SELECT ws.* FROM workout_sessions ws
       JOIN workout_plans wp ON ws.plan_id = wp.id
       WHERE ws.id = ? AND wp.user_id = ?`,
      [sessionId, userId]
    );

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Get exercises
    const exercises = all<{
      id: number;
      exercise_id: number;
      order_index: number;
      sets: number;
      reps: string;
      completed: number;
      title: string;
      description: string | null;
      type: string | null;
      body_part: string | null;
      equipment: string | null;
      level: string | null;
    }>(
      `SELECT se.id, se.exercise_id, se.order_index, se.sets, se.reps, se.completed,
              e.title, e.description, e.type, e.body_part, e.equipment, e.level
       FROM session_exercises se
       JOIN exercises e ON se.exercise_id = e.id
       WHERE se.session_id = ?
       ORDER BY se.order_index`,
      [sessionId]
    );

    res.json({
      session: {
        id: session.id,
        planId: session.plan_id,
        dayNumber: session.day_number,
        dayName: session.day_name,
        focusBodyParts: session.focus_body_parts.split(', '),
        exercises: exercises.map(e => ({
          sessionExerciseId: e.id,
          exerciseId: e.exercise_id,
          orderIndex: e.order_index,
          sets: e.sets,
          reps: e.reps,
          completed: e.completed === 1,
          title: e.title,
          description: e.description,
          type: e.type,
          bodyPart: e.body_part,
          equipment: e.equipment,
          level: e.level
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// PUT /api/workouts/exercises/:sessionExerciseId/complete - Mark exercise complete
router.put('/exercises/:sessionExerciseId/complete', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sessionExerciseId = parseInt(req.params.sessionExerciseId);
    const { setsCompleted } = req.body;

    if (isNaN(sessionExerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    const success = completeExercise(sessionExerciseId, userId, setsCompleted);

    if (!success) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    res.json({ message: 'Exercise marked as completed' });
  } catch (error) {
    console.error('Error completing exercise:', error);
    res.status(500).json({ error: 'Failed to complete exercise' });
  }
});

// PUT /api/workouts/exercises/:sessionExerciseId/uncomplete - Undo exercise completion
router.put('/exercises/:sessionExerciseId/uncomplete', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sessionExerciseId = parseInt(req.params.sessionExerciseId);

    if (isNaN(sessionExerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    const success = uncompleteExercise(sessionExerciseId, userId);

    if (!success) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    res.json({ message: 'Exercise completion undone' });
  } catch (error) {
    console.error('Error uncompleting exercise:', error);
    res.status(500).json({ error: 'Failed to undo exercise completion' });
  }
});

export default router;
