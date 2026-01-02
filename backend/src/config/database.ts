import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic, BindParams } from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct paths based on environment
// In development: __dirname is backend/src/config
// In production (bundled): __dirname is dist/backend
const isProduction = __dirname.includes('dist');
const dbPath = isProduction
  ? path.join(__dirname, 'database', 'fitorfail.db')
  : path.join(__dirname, '../../database/fitorfail.db');
const migrationsBasePath = isProduction
  ? path.join(__dirname, 'database', 'migrations')
  : path.join(__dirname, '../../database/migrations');
const datasetPath = isProduction
  ? path.join(__dirname, '..', 'dataset', 'allExercises.json')
  : path.join(__dirname, '../../../dataset/allExercises.json');

let db: SqlJsDatabase | null = null;
let SQL: SqlJsStatic | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (!db) {
    await initializeDatabase();
  }
  return db!;
}

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

async function seedExercisesIfEmpty(): Promise<void> {
  if (!db) return;

  // Check if exercises table has any data
  const result = db.exec('SELECT COUNT(*) as count FROM exercises');
  const count = result[0]?.values[0]?.[0] as number || 0;

  if (count > 0) {
    console.log(`Exercises already seeded (${count} exercises found)`);
    return;
  }

  console.log('Exercises table is empty, seeding from dataset...');

  // Load exercises from JSON
  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found at ${datasetPath}`);
    return;
  }

  const exercisesJson = fs.readFileSync(datasetPath, 'utf-8');
  const exercises: ExerciseData[] = JSON.parse(exercisesJson);

  console.log(`Found ${exercises.length} exercises to import`);

  let inserted = 0;
  for (const exercise of exercises) {
    try {
      db.run(
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

  console.log(`Successfully seeded ${inserted} exercises!`);
  saveDatabase();
}

export async function initializeDatabase(): Promise<SqlJsDatabase> {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Run migrations
  if (fs.existsSync(migrationsBasePath)) {
    const migrationFiles = fs.readdirSync(migrationsBasePath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsBasePath, file), 'utf-8');
      db.run(sql);
      console.log(`Applied migration: ${file}`);
    }
  }

  // Auto-seed exercises if table is empty
  await seedExercisesIfEmpty();

  // Save the database to disk
  saveDatabase();

  return db;
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// Helper to run a query and return all results
export function all<T = Record<string, unknown>>(sql: string, params: BindParams = []): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (Array.isArray(params) && params.length > 0) {
    stmt.bind(params);
  } else if (params && !Array.isArray(params)) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper to run a query and return first result
export function get<T = Record<string, unknown>>(sql: string, params: BindParams = []): T | null {
  const results = all<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper to run a query that doesn't return results
export function run(sql: string, params: BindParams = []): { lastInsertRowid: number | null } {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  // Get last_insert_rowid BEFORE saving to disk (saveDatabase might reset internal state)
  const result = db.exec("SELECT last_insert_rowid()");
  const lastInsertRowid = result[0]?.values[0]?.[0] as number | null;
  saveDatabase();
  return { lastInsertRowid };
}

export default { getDatabase, initializeDatabase, closeDatabase, saveDatabase, all, get, run };
