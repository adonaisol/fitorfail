# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitOrFail is a fitness application that automatically generates personalized weekly workout plans (3/4/5 day splits) using a dataset of 2,918 exercises. Users can rate exercises, track history, and refresh/customize their plans.

## Technology Stack

- **Language**: TypeScript (shared tsconfig at root)
- **Backend**: Express.js + sql.js (SQLite in pure JS) + JWT authentication
- **Frontend**: React + Vite + Tailwind CSS (mobile-first)
- **Dataset**: 2,918 exercises in `dataset/allExercises.json`

## Development Commands

### Backend (from `/backend` directory)

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Seed exercises and dev user into database
npm run db:seed
```

### Frontend (from `/frontend` directory)

```bash
# Install dependencies
npm install

# Start development server (port 5173, proxies /api to backend)
npm run dev

# Build for production (includes TypeScript check)
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
fitorfail/
├── tsconfig.json              # Shared TypeScript config
├── backend/
│   ├── tsconfig.json          # Extends root, backend-specific
│   ├── src/
│   │   ├── config/            # Database (database.ts) and env (env.ts)
│   │   ├── middleware/        # Auth middleware (auth.ts)
│   │   ├── routes/            # API endpoints (auth.ts, exercises.ts, workouts.ts)
│   │   ├── services/          # Auth (authService.ts), Workout generation (workoutGeneratorService.ts)
│   │   └── server.ts          # Express app entry point
│   ├── database/
│   │   ├── migrations/        # SQL schema (001_initial_schema.sql)
│   │   ├── seeds/             # Seed script (seedExercises.ts)
│   │   └── fitorfail.db       # SQLite database file
│   └── package.json
├── frontend/
│   ├── tsconfig.json          # Extends root, React-specific
│   ├── vite.config.js         # Vite config with API proxy
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # ProtectedRoute, ConfirmDialog, Skeleton, ErrorBoundary, RatingInput
│   │   │   ├── layout/        # Layout, Header (icon nav with tooltips), BottomNav
│   │   │   └── workout/       # WeeklyPlanView, DayCard, ExerciseCard (memoized)
│   │   ├── pages/             # HomePage, LoginPage, RegisterPage, GeneratePage, ProfilePage, HistoryPage, HelpPage
│   │   ├── contexts/          # AuthContext.tsx, WorkoutContext.tsx
│   │   ├── services/          # api.ts (axios client with auth interceptor)
│   │   ├── types/             # index.ts (TypeScript interfaces)
│   │   └── App.tsx
│   └── package.json
├── dataset/                   # Exercise data (CSV and JSON)
└── plans/                     # Implementation plan documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info (requires auth)

### Exercises
- `GET /api/exercises` - Get exercises with filters (bodyPart, equipment, level, type, limit, offset)
- `GET /api/exercises/filters` - Get available filter options
- `GET /api/exercises/:id` - Get single exercise

### Workout Plans (all require authentication)
- `POST /api/workouts/generate` - Generate new weekly plan (body: {workoutDays?: 3|4|5})
- `GET /api/workouts/current` - Get active workout plan
- `GET /api/workouts/:id` - Get specific plan details
- `PUT /api/workouts/:id/activate` - Activate a draft plan
- `POST /api/workouts/:id/refresh` - Regenerate entire week
- `POST /api/workouts/:planId/days/:dayNumber/refresh` - Regenerate single day
- `GET /api/workouts/sessions/:id` - Get session with exercises
- `PUT /api/workouts/exercises/:sessionExerciseId/complete` - Mark exercise complete
- `PUT /api/workouts/exercises/:sessionExerciseId/uncomplete` - Undo exercise completion
- `GET /api/workouts/history` - Get past workout plans

### User Preferences (all require authentication)

- `GET /api/preferences` - Get user profile and preferences
- `PUT /api/preferences` - Update preferences (workoutDays, preferredEquipment, avoidedBodyParts, skillLevel)
- `GET /api/preferences/options` - Get available equipment and body part options

### Exercise Ratings (require authentication)

- `POST /api/exercises/:id/rate` - Rate an exercise (body: {rating: 0-5, notes?: string})
- `GET /api/exercises/:id/rating` - Get user's rating for an exercise
- `DELETE /api/exercises/:id/rating` - Remove user's rating

## Database Schema

Key tables (see `backend/database/migrations/001_initial_schema.sql`):
- `users` - User credentials and skill level (Beginner/Intermediate/Expert)
- `exercises` - 2,918 exercises imported from dataset
- `user_preferences` - Workout days (3/4/5), equipment preferences
- `workout_plans` - Weekly workout plans with status (draft/active/completed)
- `workout_sessions` - Individual workout days with focus body parts
- `session_exercises` - Exercises within each session (sets, reps, completed)
- `user_exercise_ratings` - Personal ratings (override dataset ratings)
- `exercise_history` - Track completed exercises

## Development Seed User

After running `npm run db:seed`, a development user is created:
- **Username**: `super`
- **Password**: `pass123`
- **Skill Level**: Intermediate

## Workout Generation Algorithm

The `workoutGeneratorService.ts` implements:

**Split Strategies:**
- **3-day**: Full Body A (Push), Full Body B (Pull), Full Body C (Legs & Core)
- **4-day**: Upper Push, Lower Body, Upper Pull, Lower Body & Core
- **5-day**: Push, Pull, Legs, Arms & Core, Shoulders & Back

**Exercise Scoring:**
```
Score = (User Rating OR Dataset Rating) × 20
      + Skill Level Match × 30
      + Equipment Preference × 20
      - Recency Penalty (0-50)
      + Exercise Type Bonus × 10
      + Random Factor (0-15)
```

## Exercise Data Structure

```typescript
interface Exercise {
  id: number;
  title: string;
  description: string | null;
  type: string;       // Strength, Cardio, Powerlifting, etc.
  bodyPart: string;   // Chest, Back, Quadriceps, etc.
  equipment: string;  // Barbell, Dumbbell, Body Only, Machine, etc.
  level: string;      // Beginner, Intermediate, Expert
  rating: number | null;
  ratingDesc: string | null;
}
```

## Implementation Status

- [x] **Phase 1: Foundation Setup** - Backend, Frontend, Database, TypeScript conversion
- [x] **Phase 2: Authentication System** - JWT auth, login/register, protected routes
- [x] **Phase 3: Workout Generation Engine** - Split strategies, exercise scoring, all CRUD endpoints
- [x] **Phase 4: Weekly Workout View** - WeeklyPlanView, DayCard, ExerciseCard, GeneratePage
- [x] **Phase 5: Workout Management** - Toast notifications, confirmation dialogs, loading skeletons, undo completion
- [x] **Phase 6: User Preferences & Ratings** - Profile page, preferences form, exercise ratings
- [x] **Phase 7: Partial Refresh Feature** - Refresh only uncompleted exercises/days
- [x] **Phase 8: History & Analytics** - Past workouts, statistics, streaks
- [x] **Phase 9: Polish & Testing** - ErrorBoundary, accessibility (ARIA, focus trap), performance (React.memo), Help page, Header redesign
- [ ] **Phase 10: Time-based Constraints** - Prevent modifying past days, completing future days (Post-MVP)

## Key Files

**Backend:**

- `src/services/workoutGeneratorService.ts` - Core workout generation algorithm
- `src/services/authService.ts` - Password hashing, JWT generation
- `src/routes/workouts.ts` - All workout API endpoints
- `src/routes/preferences.ts` - User preferences API endpoints
- `src/config/database.ts` - sql.js database helper functions

**Frontend:**

- `src/contexts/WorkoutContext.tsx` - Workout state management
- `src/components/workout/WeeklyPlanView.tsx` - Main workout display
- `src/components/workout/DayCard.tsx` - Day card with exercises (memoized)
- `src/components/workout/ExerciseCard.tsx` - Exercise card (memoized)
- `src/components/common/ConfirmDialog.tsx` - Accessible confirmation modal (focus trap, ARIA)
- `src/components/common/Skeleton.tsx` - Loading skeleton components
- `src/components/common/ErrorBoundary.tsx` - Global error boundary
- `src/components/common/RatingInput.tsx` - Star rating component
- `src/components/layout/Header.tsx` - Icon navigation with tooltips
- `src/pages/LandingPage.tsx` - Public landing page for new users
- `src/pages/GeneratePage.tsx` - Plan generation wizard
- `src/pages/ProfilePage.tsx` - User profile and preferences
- `src/pages/HistoryPage.tsx` - Workout history and stats
- `src/pages/HelpPage.tsx` - User guide and instructions
- `src/services/api.ts` - Axios client with auth interceptor

## Frontend Routes

```
/                 -> LandingPage (unauthenticated users, redirects to /home if logged in)
/login            -> LoginPage
/register         -> RegisterPage
/home             -> HomePage (current week workout or empty state) [protected]
/home/generate    -> GeneratePage (create new plan) [protected]
/home/history     -> HistoryPage (past workouts, stats) [protected]
/home/profile     -> ProfilePage (settings & preferences) [protected]
/home/help        -> HelpPage (user guide) [protected]
```
