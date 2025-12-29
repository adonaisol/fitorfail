import { initializeDatabase, closeDatabase, run, get, saveDatabase } from '../../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exercisesPath = path.join(__dirname, '../../../dataset/allExercises.json');

console.log('Seeding exercises from dataset...');

try {
  // Initialize database first (runs migrations)
  await initializeDatabase();

  // Read exercises from JSON file
  const exercisesJson = fs.readFileSync(exercisesPath, 'utf-8');
  const exercises = JSON.parse(exercisesJson);

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
      console.error(`Failed to insert exercise ${exercise.id}:`, err.message);
    }
  }

  // Verify count
  const countResult = get('SELECT COUNT(*) as count FROM exercises');
  console.log(`Successfully imported ${countResult?.count || 0} exercises!`);

} catch (error) {
  console.error('Failed to seed exercises:', error);
  process.exit(1);
} finally {
  closeDatabase();
}
