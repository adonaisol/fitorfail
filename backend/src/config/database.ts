import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic, BindParams } from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database/fitorfail.db');

let db: SqlJsDatabase | null = null;
let SQL: SqlJsStatic | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (!db) {
    await initializeDatabase();
  }
  return db!;
}

export async function initializeDatabase(): Promise<SqlJsDatabase> {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Run migrations
  const migrationsPath = path.join(__dirname, '../../database/migrations');
  if (fs.existsSync(migrationsPath)) {
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf-8');
      db.run(sql);
      console.log(`Applied migration: ${file}`);
    }
  }

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
