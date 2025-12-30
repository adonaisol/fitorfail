-- Migration: Add 'cancelled' status to workout_plans
-- SQLite doesn't support ALTER CONSTRAINT, so we need to recreate the table

-- Step 1: Create new table with updated constraint
CREATE TABLE IF NOT EXISTS workout_plans_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    workout_days INTEGER NOT NULL,
    status TEXT CHECK(status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy data from old table (if it exists and has data)
INSERT OR IGNORE INTO workout_plans_new (id, user_id, week_start_date, workout_days, status, created_at)
SELECT id, user_id, week_start_date, workout_days, status, created_at
FROM workout_plans WHERE EXISTS (SELECT 1 FROM workout_plans LIMIT 1);

-- Step 3: Drop old table
DROP TABLE IF EXISTS workout_plans;

-- Step 4: Rename new table
ALTER TABLE workout_plans_new RENAME TO workout_plans;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON workout_plans(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_workout_plans_status ON workout_plans(user_id, status);
