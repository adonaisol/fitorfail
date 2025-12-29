import { Router } from 'express';
import { all, get } from '../config/database.js';

const router = Router();

// GET /api/exercises - Get all exercises with optional filters
router.get('/', (req, res) => {
  try {
    const { bodyPart, equipment, level, type, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];

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

    const exercises = all(sql, params);

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM exercises WHERE 1=1';
    const countParams = [];
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

    const countResult = get(countSql, countParams);

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
router.get('/filters', (req, res) => {
  try {
    const bodyParts = all('SELECT DISTINCT body_part FROM exercises WHERE body_part IS NOT NULL ORDER BY body_part');
    const equipment = all('SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment');
    const levels = all('SELECT DISTINCT level FROM exercises WHERE level IS NOT NULL ORDER BY level');
    const types = all('SELECT DISTINCT type FROM exercises WHERE type IS NOT NULL ORDER BY type');

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
router.get('/:id', (req, res) => {
  try {
    const exercise = get('SELECT * FROM exercises WHERE id = ?', [req.params.id]);

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
router.post('/:id/rate', (req, res) => {
  // TODO: Implement in Phase 6 (requires auth)
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
