import { Router, Request, Response } from 'express';
import type { SqlValue } from 'sql.js';
import { all, get, run } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

interface Exercise {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  body_part: string | null;
  equipment: string | null;
  level: string | null;
  rating: number | null;
  rating_desc: string | null;
}

interface ExerciseQuery {
  bodyPart?: string;
  equipment?: string;
  level?: string;
  type?: string;
  limit?: string;
  offset?: string;
}

// GET /api/exercises - Get all exercises with optional filters
router.get('/', (req: Request<object, object, object, ExerciseQuery>, res: Response) => {
  try {
    const { bodyPart, equipment, level, type, limit = '50', offset = '0' } = req.query;

    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params: SqlValue[] = [];

    // TODO: Pass bodyPart, equipment, level, type through upper-case function to match DB values
    if (bodyPart) {
      sql += ' AND body_part = ?';
      params.push(bodyPart);
    }
    if (equipment) {
      sql += ' AND equipment = ?';
      params.push(equipment);
    }
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const exercises = all<Exercise>(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM exercises WHERE 1=1';
    const countParams: SqlValue[] = [];
    if (bodyPart) {
      countSql += ' AND body_part = ?';
      countParams.push(bodyPart);
    }
    if (equipment) {
      countSql += ' AND equipment = ?';
      countParams.push(equipment);
    }
    if (level) {
      countSql += ' AND level = ?';
      countParams.push(level);
    }
    if (type) {
      countSql += ' AND type = ?';
      countParams.push(type);
    }

    const countResult = get<{ total: number }>(countSql, countParams);

    res.json({
      exercises,
      pagination: {
        total: countResult?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// GET /api/exercises/filters - Get available filter options
router.get('/filters', (_req: Request, res: Response) => {
  try {
    const bodyParts = all<{ body_part: string }>('SELECT DISTINCT body_part FROM exercises WHERE body_part IS NOT NULL ORDER BY body_part');
    const equipment = all<{ equipment: string }>('SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment');
    const levels = all<{ level: string }>('SELECT DISTINCT level FROM exercises WHERE level IS NOT NULL ORDER BY level');
    const types = all<{ type: string }>('SELECT DISTINCT type FROM exercises WHERE type IS NOT NULL ORDER BY type');

    res.json({
      bodyParts: bodyParts.map(r => r.body_part),
      equipment: equipment.map(r => r.equipment),
      levels: levels.map(r => r.level),
      types: types.map(r => r.type)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// GET /api/exercises/:id - Get single exercise
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const exercise = get<Exercise>('SELECT * FROM exercises WHERE id = ?', [req.params.id]);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// POST /api/exercises/:id/rate - Rate an exercise (requires auth)
router.post('/:id/rate', authenticate, (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.userId!;
    const exerciseId = parseInt(req.params.id);
    const { rating: rawRating, notes } = req.body;

    // Ensure rating is a number
    const rating = typeof rawRating === 'string' ? parseFloat(rawRating) : rawRating;

    if (isNaN(exerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    // Validate rating
    if (rating === undefined || rating === null || isNaN(rating) || rating < 0 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 0 and 5' });
      return;
    }

    // Check if exercise exists
    const exercise = get<{ id: number }>('SELECT id FROM exercises WHERE id = ?', [exerciseId]);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    // Check if rating exists
    const existingRating = get<{ id: number }>(
      'SELECT id FROM user_exercise_ratings WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    );

    if (existingRating) {
      // Update existing rating
      run(
        `UPDATE user_exercise_ratings
         SET rating = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND exercise_id = ?`,
        [rating, notes || null, userId, exerciseId]
      );
    } else {
      // Create new rating
      run(
        `INSERT INTO user_exercise_ratings (user_id, exercise_id, rating, notes)
         VALUES (?, ?, ?, ?)`,
        [userId, exerciseId, rating, notes || null]
      );
    }

    res.json({
      message: 'Rating saved successfully',
      rating: {
        exerciseId,
        rating,
        notes: notes || null
      }
    });
  } catch (error) {
    console.error('Error saving rating:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to save rating: ${errorMessage}` });
  }
});

// GET /api/exercises/:id/rating - Get user's rating for an exercise (requires auth)
router.get('/:id/rating', authenticate, (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.userId!;
    const exerciseId = parseInt(req.params.id);

    if (isNaN(exerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    const userRating = get<{ rating: number; notes: string | null }>(
      'SELECT rating, notes FROM user_exercise_ratings WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    );

    res.json({
      exerciseId,
      rating: userRating?.rating || null,
      notes: userRating?.notes || null
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// DELETE /api/exercises/:id/rating - Remove user's rating for an exercise
router.delete('/:id/rating', authenticate, (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.userId!;
    const exerciseId = parseInt(req.params.id);

    if (isNaN(exerciseId)) {
      res.status(400).json({ error: 'Invalid exercise ID' });
      return;
    }

    run(
      'DELETE FROM user_exercise_ratings WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    );

    res.json({ message: 'Rating removed successfully' });
  } catch (error) {
    console.error('Error removing rating:', error);
    res.status(500).json({ error: 'Failed to remove rating' });
  }
});

export default router;
