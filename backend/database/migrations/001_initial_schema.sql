-- FitOrFail Database Schema
-- SQLite database for fitness workout planning application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    skill_level TEXT CHECK(skill_level IN ('Beginner', 'Intermediate', 'Expert')) DEFAULT 'Beginner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table (imported from dataset)
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    body_part TEXT,
    equipment TEXT,
    level TEXT,
    rating REAL,
    rating_desc TEXT
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    workout_days INTEGER CHECK(workout_days IN (3, 4, 5)) DEFAULT 3,
    preferred_equipment TEXT,
    avoided_body_parts TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Weekly workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    workout_days INTEGER NOT NULL,
    status TEXT CHECK(status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Individual workout sessions (days)
CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    day_name TEXT,
    focus_body_parts TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
);

-- Exercises in each session
CREATE TABLE IF NOT EXISTS session_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER DEFAULT 3,
    reps TEXT DEFAULT '8-12',
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- User exercise ratings (overrides dataset ratings)
CREATE TABLE IF NOT EXISTS user_exercise_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    rating REAL CHECK(rating >= 0 AND rating <= 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    UNIQUE(user_id, exercise_id)
);

-- Exercise history (completed exercises)
CREATE TABLE IF NOT EXISTS exercise_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    session_exercise_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sets_completed INTEGER,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON workout_plans(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_workout_plans_status ON workout_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan ON workout_sessions(plan_id);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_exercise_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_exercise ON user_exercise_ratings(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_history_user ON exercise_history(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises(body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
