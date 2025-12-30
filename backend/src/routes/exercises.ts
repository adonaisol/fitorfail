import { Router, Request, Response } from 'express';
import type { SqlValue } from 'sql.js';
import { all, get } from '../config/database.js';

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

// POST /api/exercises/:id/rate - Rate an exercise
router.post('/:id/rate', (_req: Request, res: Response) => {
  // TODO: Implement in Phase 6 (requires auth)
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
