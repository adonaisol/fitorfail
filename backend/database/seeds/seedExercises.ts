import { initializeDatabase, closeDatabase, run, get } from '../../src/config/database.js';
import { hashPassword } from '../../src/services/authService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exercisesPath = path.join(__dirname, '../../../dataset/allExercises.json');

interface ExerciseData {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  bodyPart: string | null;
  equipment: string | null;
  level: string | null;
  rating: number | null;
  ratingDesc: string | null;
}

console.log('Seeding exercises from dataset...');

try {
  // Initialize database first (runs migrations)
  await initializeDatabase();

  // Read exercises from JSON file
  const exercisesJson = fs.readFileSync(exercisesPath, 'utf-8');
  const exercises: ExerciseData[] = JSON.parse(exercisesJson);

  console.log(`Found ${exercises.length} exercises to import`);

  // Insert exercises one by one
  let inserted = 0;
  for (const exercise of exercises) {
    try {
      run(
        `INSERT OR REPLACE INTO exercises (id, title, description, type, body_part, equipment, level, rating, rating_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.id,
          exercise.title,
          exercise.description,
          exercise.type,
          exercise.bodyPart,
          exercise.equipment,
          exercise.level,
          exercise.rating,
          exercise.ratingDesc
        ]
      );
      inserted++;
      if (inserted % 500 === 0) {
        console.log(`Inserted ${inserted} exercises...`);
      }
    } catch (err) {
      console.error(`Failed to insert exercise ${exercise.id}:`, (err as Error).message);
    }
  }

  // Verify count
  const countResult = get<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
  console.log(`Successfully imported ${countResult?.count || 0} exercises!`);

  // Seed development user
  console.log('\nSeeding development user...');
  const existingUser = get<{ id: number }>('SELECT id FROM users WHERE username = ?', ['super']);

  if (!existingUser) {
    const passwordHash = await hashPassword('pass123');
    run(
      'INSERT INTO users (username, password_hash, skill_level) VALUES (?, ?, ?)',
      ['super', passwordHash, 'Intermediate']
    );

    // Get the user id and create default preferences
    const user = get<{ id: number }>('SELECT id FROM users WHERE username = ?', ['super']);
    if (user) {
      run(
        'INSERT INTO user_preferences (user_id, workout_days) VALUES (?, ?)',
        [user.id, 3]
      );
    }
    console.log('Created seed user: super / pass123');
  } else {
    console.log('Seed user "super" already exists, skipping...');
  }

} catch (error) {
  console.error('Failed to seed exercises:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
