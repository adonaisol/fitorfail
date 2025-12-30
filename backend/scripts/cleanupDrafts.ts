import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanup() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'database', 'fitorfail.db');

  if (!fs.existsSync(dbPath)) {
    console.log('Database not found at:', dbPath);
    return;
  }

  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  // Show current plans
  const plans = db.exec('SELECT id, user_id, week_start_date, status FROM workout_plans ORDER BY week_start_date DESC');
  console.log('Current plans:');
  if (plans.length > 0) {
    plans[0].values.forEach(row => {
      console.log(`  ID: ${row[0]} | User: ${row[1]} | Week: ${row[2]} | Status: ${row[3]}`);
    });
  }

  // Find duplicate drafts (same user, same week, status=draft, keep only the latest)
  const duplicateDrafts = db.exec(`
    SELECT id FROM workout_plans
    WHERE status = 'draft'
    AND id NOT IN (
      SELECT MAX(id) FROM workout_plans
      WHERE status = 'draft'
      GROUP BY user_id, week_start_date
    )
  `);

  if (duplicateDrafts.length > 0 && duplicateDrafts[0].values.length > 0) {
    const idsToDelete = duplicateDrafts[0].values.map(r => r[0]) as number[];
    console.log('\nDeleting duplicate draft plan IDs:', idsToDelete);

    for (const id of idsToDelete) {
      db.run('DELETE FROM session_exercises WHERE session_id IN (SELECT id FROM workout_sessions WHERE plan_id = ?)', [id]);
      db.run('DELETE FROM workout_sessions WHERE plan_id = ?', [id]);
      db.run('DELETE FROM workout_plans WHERE id = ?', [id]);
    }

    // Save the database
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('Cleanup complete!');
  } else {
    console.log('\nNo duplicate drafts found to clean up.');
  }

  // Show remaining plans
  const remaining = db.exec('SELECT id, user_id, week_start_date, status FROM workout_plans ORDER BY week_start_date DESC');
  console.log('\nRemaining plans:');
  if (remaining.length > 0) {
    remaining[0].values.forEach(row => {
      console.log(`  ID: ${row[0]} | User: ${row[1]} | Week: ${row[2]} | Status: ${row[3]}`);
    });
  }

  db.close();
}

cleanup().catch(console.error);
