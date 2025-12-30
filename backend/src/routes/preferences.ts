import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { get, run, all } from '../config/database.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

interface UserPreferences {
  id: number;
  user_id: number;
  workout_days: number;
  preferred_equipment: string | null;
  avoided_body_parts: string | null;
}

// GET /api/preferences - Get current user's preferences
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Get user info
    const user = get<{ id: number; username: string; skill_level: string }>(
      'SELECT id, username, skill_level FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get preferences (create default if not exists)
    let preferences = get<UserPreferences>(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (!preferences) {
      // Create default preferences
      run(
        'INSERT INTO user_preferences (user_id, workout_days) VALUES (?, 3)',
        [userId]
      );
      preferences = get<UserPreferences>(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        skillLevel: user.skill_level
      },
      preferences: {
        workoutDays: preferences?.workout_days || 3,
        preferredEquipment: preferences?.preferred_equipment
          ? preferences.preferred_equipment.split(',').map(e => e.trim())
          : [],
        avoidedBodyParts: preferences?.avoided_body_parts
          ? preferences.avoided_body_parts.split(',').map(e => e.trim())
          : []
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences - Update current user's preferences
router.put('/', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { workoutDays, preferredEquipment, avoidedBodyParts, skillLevel } = req.body;

    // Validate workout days
    if (workoutDays !== undefined && ![3, 4, 5].includes(workoutDays)) {
      res.status(400).json({ error: 'Workout days must be 3, 4, or 5' });
      return;
    }

    // Validate skill level
    if (skillLevel !== undefined && !['Beginner', 'Intermediate', 'Expert'].includes(skillLevel)) {
      res.status(400).json({ error: 'Invalid skill level' });
      return;
    }

    // Update user skill level if provided
    if (skillLevel !== undefined) {
      run(
        'UPDATE users SET skill_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [skillLevel, userId]
      );
    }

    // Check if preferences exist
    const existing = get<{ id: number }>(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    const equipmentStr = Array.isArray(preferredEquipment)
      ? preferredEquipment.join(', ')
      : preferredEquipment || null;

    const bodyPartsStr = Array.isArray(avoidedBodyParts)
      ? avoidedBodyParts.join(', ')
      : avoidedBodyParts || null;

    if (existing) {
      // Update existing preferences
      const updates: string[] = [];
      const params: (string | number | null)[] = [];

      if (workoutDays !== undefined) {
        updates.push('workout_days = ?');
        params.push(workoutDays);
      }
      if (preferredEquipment !== undefined) {
        updates.push('preferred_equipment = ?');
        params.push(equipmentStr);
      }
      if (avoidedBodyParts !== undefined) {
        updates.push('avoided_body_parts = ?');
        params.push(bodyPartsStr);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);
        run(
          `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
          params
        );
      }
    } else {
      // Create new preferences
      run(
        `INSERT INTO user_preferences (user_id, workout_days, preferred_equipment, avoided_body_parts)
         VALUES (?, ?, ?, ?)`,
        [userId, workoutDays || 3, equipmentStr, bodyPartsStr]
      );
    }

    // Fetch updated data
    const user = get<{ id: number; username: string; skill_level: string }>(
      'SELECT id, username, skill_level FROM users WHERE id = ?',
      [userId]
    );

    const preferences = get<UserPreferences>(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user?.id,
        username: user?.username,
        skillLevel: user?.skill_level
      },
      preferences: {
        workoutDays: preferences?.workout_days || 3,
        preferredEquipment: preferences?.preferred_equipment
          ? preferences.preferred_equipment.split(',').map(e => e.trim())
          : [],
        avoidedBodyParts: preferences?.avoided_body_parts
          ? preferences.avoided_body_parts.split(',').map(e => e.trim())
          : []
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// GET /api/preferences/options - Get available equipment and body parts for selection
router.get('/options', (_req: Request, res: Response) => {
  try {
    const equipment = all<{ equipment: string }>(
      `SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL AND equipment != '' ORDER BY equipment`
    ).map(row => row.equipment);

    const bodyParts = all<{ body_part: string }>(
      `SELECT DISTINCT body_part FROM exercises WHERE body_part IS NOT NULL AND body_part != '' ORDER BY body_part`
    ).map(row => row.body_part);

    res.json({
      equipment,
      bodyParts
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({ error: 'Failed to fetch options' });
  }
});

export default router;
