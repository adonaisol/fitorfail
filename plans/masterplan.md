# FitOrFail Implementation Plan

## Overview
Full-stack fitness application that automatically generates personalized weekly workout plans (3/4/5 day splits) using a dataset of 2,918 exercises. Users can rate exercises, track history, and refresh plans.

## Technology Stack
- **Language**: TypeScript (shared tsconfig)
- **Backend**: Express.js + sql.js (pure JS SQLite) + JWT authentication
- **Frontend**: React + Vite + Tailwind CSS (mobile-first)
- **Dataset**: 2,918 exercises from `dataset/allExercises.json`

---

## Implementation Phases

### Phase 1: Foundation Setup ✅ COMPLETED
**Completed:**
- [x] Backend Express server with TypeScript
- [x] sql.js database integration (switched from better-sqlite3 due to native module issues)
- [x] Database migrations (001_initial_schema.sql)
- [x] Exercise seeding from JSON dataset (2,918 exercises)
- [x] Frontend Vite + React + Tailwind setup
- [x] Shared TypeScript configuration
- [x] Basic Layout with Header and BottomNav
- [x] Health check endpoint

**Files created:**
- `backend/src/server.ts`, `backend/src/config/database.ts`, `backend/src/config/env.ts`
- `backend/database/migrations/001_initial_schema.sql`
- `backend/database/seeds/seedExercises.ts`
- `frontend/src/App.tsx`, `frontend/src/components/layout/*`
- Root `tsconfig.json` with project references

---

### Phase 2: Authentication System ✅ COMPLETED
**Completed:**
- [x] Auth service with bcrypt password hashing
- [x] JWT token generation and verification
- [x] Auth middleware for protected routes
- [x] Register, login, and /me endpoints
- [x] Frontend AuthContext with useAuth hook
- [x] Login and Register pages with form validation
- [x] ProtectedRoute component
- [x] API service with axios interceptors
- [x] Seed user creation (super/pass123)

**Files created:**
- `backend/src/services/authService.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/routes/auth.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/components/common/ProtectedRoute.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/types/index.ts`

**Bug fixes:**
- Fixed sql.js `last_insert_rowid()` timing issue in database.ts

---

### Phase 3: Workout Generation Engine ✅ COMPLETED
**Completed:**
- [x] Workout generator service with split strategies (3/4/5 day)
- [x] Exercise scoring algorithm (rating, skill level, equipment, recency, type)
- [x] Plan generation with balanced exercise selection per body part
- [x] All workout CRUD endpoints
- [x] Day refresh functionality
- [x] Exercise completion tracking
- [x] Exercise history recording

**Files created:**
- `backend/src/services/workoutGeneratorService.ts`
- `backend/src/routes/workouts.ts` (fully implemented)

**Split Strategies Implemented:**
- **3-day**: Full Body A (Push Focus), Full Body B (Pull Focus), Full Body C (Legs & Core)
- **4-day**: Upper Push, Lower Body, Upper Pull, Lower Body & Core
- **5-day**: Push Day, Pull Day, Legs, Arms & Core, Shoulders & Back

**API Endpoints:**
- `POST /api/workouts/generate` - Generate new plan
- `GET /api/workouts/current` - Get active plan
- `GET /api/workouts/:id` - Get specific plan
- `PUT /api/workouts/:id/activate` - Activate draft plan
- `POST /api/workouts/:id/refresh` - Refresh all days
- `POST /api/workouts/:planId/days/:dayNumber/refresh` - Refresh single day
- `POST /api/workouts/:planId/days/:dayNumber/refresh-uncompleted` - Refresh uncompleted exercises
- `GET /api/workouts/sessions/:id` - Get session details
- `PUT /api/workouts/exercises/:sessionExerciseId/complete` - Mark complete
- `PUT /api/workouts/exercises/:sessionExerciseId/uncomplete` - Undo completion
- `POST /api/workouts/exercises/:sessionExerciseId/replace` - Replace single exercise
- `GET /api/workouts/history` - Get past plans

---

### Phase 4: Weekly Workout View ✅ COMPLETED
**Completed:**
- [x] WorkoutContext for state management
- [x] WeeklyPlanView component with overall progress
- [x] DayCard component with day progress and refresh
- [x] ExerciseCard component with expand/collapse and complete
- [x] HomePage integration showing active plan or empty state
- [x] GeneratePage with split selection wizard
- [x] Plan preview before activation
- [x] Header with logout button and username
- [x] API service with all workout methods

**Files created:**
- `frontend/src/contexts/WorkoutContext.tsx`
- `frontend/src/components/workout/WeeklyPlanView.tsx`
- `frontend/src/components/workout/DayCard.tsx`
- `frontend/src/components/workout/ExerciseCard.tsx`
- `frontend/src/components/workout/index.ts`
- `frontend/src/pages/GeneratePage.tsx`

**Updated:**
- `frontend/src/pages/HomePage.tsx` - Shows workout plan or empty state
- `frontend/src/components/layout/Header.tsx` - Added logout and username
- `frontend/src/App.tsx` - Added WorkoutProvider and /generate route
- `frontend/src/types/index.ts` - Added workout types
- `frontend/src/services/api.ts` - Added workoutApi

---

### Phase 5: Workout Management ✅ COMPLETED
**Completed:**
- [x] Toast notifications for actions (exercise complete, day refreshed, plan activated)
- [x] Confirmation dialogs for destructive actions (refresh day, refresh all)
- [x] Loading skeletons for workout plan
- [x] Undo exercise completion (click completed exercise to undo)
- [x] Toaster component setup with custom styling

**Files created:**
- `frontend/src/components/common/ConfirmDialog.tsx`
- `frontend/src/components/common/Skeleton.tsx`

**Files updated:**
- `frontend/src/App.tsx` - Added Toaster component
- `frontend/src/pages/HomePage.tsx` - Loading skeleton, uncomplete support
- `frontend/src/pages/GeneratePage.tsx` - Toast notifications
- `frontend/src/components/workout/WeeklyPlanView.tsx` - Confirmation dialog, toasts, uncomplete
- `frontend/src/components/workout/DayCard.tsx` - Confirmation dialog, toasts, uncomplete
- `frontend/src/components/workout/ExerciseCard.tsx` - Undo completion, toasts
- `frontend/src/contexts/WorkoutContext.tsx` - uncompleteExercise function
- `frontend/src/services/api.ts` - uncompleteExercise API method
- `backend/src/services/workoutGeneratorService.ts` - uncompleteExercise function
- `backend/src/routes/workouts.ts` - PUT /exercises/:id/uncomplete endpoint

---

### Phase 6: User Preferences & Ratings ✅ COMPLETED

**Completed:**

- [x] ProfilePage with user info and preferences form
- [x] PreferencesForm (skill level, workout days, equipment, avoided body parts)
- [x] Preferences API endpoints (GET /api/preferences, PUT /api/preferences, GET /api/preferences/options)
- [x] RatingInput component (star rating)
- [x] Exercise rating API endpoints (POST /api/exercises/:id/rate, GET /api/exercises/:id/rating, DELETE /api/exercises/:id/rating)
- [x] Algorithm already uses preferences from Phase 3

**Files created:**

- `backend/src/routes/preferences.ts` - Preferences API routes
- `frontend/src/pages/ProfilePage.tsx` - Profile and settings page
- `frontend/src/components/common/RatingInput.tsx` - Star rating component

**Files updated:**

- `backend/src/server.ts` - Added preferences routes
- `backend/src/routes/exercises.ts` - Added rating endpoints
- `frontend/src/App.tsx` - Added profile route
- `frontend/src/contexts/AuthContext.tsx` - Added updateUser function
- `frontend/src/services/api.ts` - Added preferencesApi and ratingApi
- `frontend/src/types/index.ts` - Added UserPreferences, UserProfile, ExerciseRating types

---

### Phase 7: Partial Refresh Feature ✅ COMPLETED

**Completed:**

- [x] Refresh only uncompleted exercises within a day
  - Added "Refresh X Uncompleted" option in day refresh confirmation dialog
  - Backend endpoint `POST /api/workouts/:planId/days/:dayNumber/refresh-uncompleted`
- [x] Refresh only incomplete days when refreshing whole week
  - Added "Refresh X Incomplete Days" option in week refresh confirmation dialog
  - Backend endpoint `POST /api/workouts/:id/refresh-incomplete`
- [x] Updated ConfirmDialog to support multiple action buttons

**Files created/updated:**

- `backend/src/services/workoutGeneratorService.ts` - Added `refreshUncompletedExercises` and `refreshIncompleteDays` functions
- `backend/src/routes/workouts.ts` - Added new endpoints
- `frontend/src/components/common/ConfirmDialog.tsx` - Added `actions` prop for multiple buttons
- `frontend/src/components/workout/DayCard.tsx` - Added partial refresh option
- `frontend/src/components/workout/WeeklyPlanView.tsx` - Added partial refresh option
- `frontend/src/contexts/WorkoutContext.tsx` - Added new context functions
- `frontend/src/services/api.ts` - Added new API methods
- `frontend/src/pages/HomePage.tsx` - Updated to pass new props

---

### Phase 8: History & Analytics ✅ COMPLETED

**Completed:**

- [x] HistoryPage showing past workout plans with completion stats
- [x] Statistics cards (workouts completed, exercises done, streaks)
- [x] Exercise frequency tracking (top exercises, most worked body parts)
- [x] Streak tracking (current and longest)
- [x] Recent activity tracking
- [x] HomePage stats preview

**API Endpoints:**

- `GET /api/stats` - Get comprehensive user statistics
- `GET /api/stats/history` - Get detailed workout history with completion percentages

**Files created:**

- `backend/src/routes/stats.ts` - Stats API routes
- `frontend/src/pages/HistoryPage.tsx` - History and stats page

**Files updated:**

- `backend/src/server.ts` - Added stats routes
- `frontend/src/types/index.ts` - Added UserStats, HistoryPlan types
- `frontend/src/services/api.ts` - Added statsApi
- `frontend/src/App.tsx` - Added /history route
- `frontend/src/pages/HomePage.tsx` - Added real stats to dashboard

---

### Phase 9: Polish & Testing ✅ COMPLETED

**Completed:**

- [x] Comprehensive error handling
  - ErrorBoundary component wrapping entire app
  - Graceful error recovery with retry option
- [x] Accessibility improvements
  - ConfirmDialog: ARIA attributes, focus trap, keyboard navigation (Escape to close)
  - BottomNav: aria-label, role="menubar/menuitem", aria-current
  - Body scroll lock when dialogs open
- [x] Performance optimization
  - React.memo() on ExerciseCard and DayCard
  - useCallback for event handlers
  - useMemo for computed values
- [x] Loading states
  - StatsCardSkeleton and StatsGridSkeleton components
  - Stats loading state on HomePage with error retry
- [x] README documentation
  - Comprehensive README with features, setup, API docs, and architecture
- [x] Help page
  - Full user guide at /help route
  - Sections: Getting Started, Generating Workouts, Completing Exercises, Refreshing, Rating, History, Stats, Profile
  - Accessible from Header (all screens) and Profile page
- [x] Header redesign
  - Desktop: Workouts, History, Help, Profile, Logout icons with tooltips
  - Mobile: Help and Logout icons
  - Removed redundant elements (username shown in welcome message)

**Files created:**

- `frontend/src/components/common/ErrorBoundary.tsx`
- `frontend/src/pages/HelpPage.tsx`

**Files updated:**

- `frontend/src/App.tsx` - ErrorBoundary wrapper, HelpPage route
- `frontend/src/components/common/ConfirmDialog.tsx` - Full accessibility support
- `frontend/src/components/common/Skeleton.tsx` - Stats skeletons
- `frontend/src/components/workout/ExerciseCard.tsx` - React.memo, useCallback
- `frontend/src/components/workout/DayCard.tsx` - React.memo, useMemo, useCallback
- `frontend/src/components/layout/BottomNav.tsx` - Accessibility attributes
- `frontend/src/components/layout/Header.tsx` - Icon navigation with tooltips
- `frontend/src/pages/HomePage.tsx` - Stats loading state with error handling
- `frontend/src/pages/ProfilePage.tsx` - Help link added
- `README.md` - Comprehensive documentation

---

### Phase 9.5: Landing Page & Exercise Replacement ✅ COMPLETED

**Completed:**

**Landing Page (`LandingPage.tsx`)**
- [x] Public landing page for unauthenticated users
- [x] Hero section explaining the app's purpose
- [x] Feature cards (Skill-Based, Smart Generation, Flexible Refresh, Personal Ratings, Track Progress)
- [x] Workout split cards (3/4/5 day) with horizontal scroll on mobile
- [x] Difficulty color progression (green → amber → red)
- [x] Call-to-action section with registration link
- [x] Auto-redirect to `/home` for authenticated users
- [x] Mobile-responsive design with side-by-side buttons and cards

**Replace Single Exercise**
- [x] Backend: `replaceSingleExercise()` function in `workoutGeneratorService.ts`
- [x] API: `POST /api/workouts/exercises/:id/replace` endpoint
- [x] Frontend: Replace button (↔ icon) next to each uncompleted exercise
- [x] Smart replacement: same body part, not already in plan, uses scoring algorithm
- [x] Button hidden when exercise is completed
- [x] Tooltip on hover showing "Replace"

**Routing Changes:**
- [x] `/` now shows LandingPage for unauthenticated users
- [x] Protected routes moved under `/home` prefix
- [x] Updated all navigation links accordingly

**Documentation:**
- [x] Updated Help page with replace exercise instructions
- [x] Updated README with new feature and API endpoint

**Files created:**
- `frontend/src/pages/LandingPage.tsx`

**Files updated:**
- `backend/src/services/workoutGeneratorService.ts` - Added `replaceSingleExercise` function
- `backend/src/routes/workouts.ts` - Added replace endpoint
- `frontend/src/services/api.ts` - Added `replaceExercise` method
- `frontend/src/contexts/WorkoutContext.tsx` - Added `replaceExercise` function
- `frontend/src/components/workout/ExerciseCard.tsx` - Added replace button with ArrowLeftRight icon
- `frontend/src/components/workout/DayCard.tsx` - Pass onReplaceExercise prop
- `frontend/src/components/workout/WeeklyPlanView.tsx` - Pass onReplaceExercise prop
- `frontend/src/pages/HomePage.tsx` - Pass replaceExercise to WeeklyPlanView
- `frontend/src/pages/HelpPage.tsx` - Added replace exercise documentation
- `frontend/src/App.tsx` - Updated routing structure
- `README.md` - Added feature and API endpoint

---

### Phase 10: Time-based Constraints 🔲 NOT STARTED (Post-MVP)

**Planned:**

- [ ] Define day scheduling system (which days user will exercise)
- [ ] Prevent refreshing/modifying exercises for past days
- [ ] Prevent completing exercises for future days
- [ ] Visual indicators for past/current/future days
- [ ] Graceful handling when user misses a day

**Design Considerations:**

- Need to determine how to identify past/future days without restricting user flexibility
- Options: calendar-based, sequential completion, or user-defined schedule
- Consider timezone handling for day boundaries

---

## Database Schema

### Core Tables (Implemented)

**users**
- id, username, password_hash, skill_level (Beginner/Intermediate/Expert)
- created_at, updated_at

**exercises** (2,918 imported from dataset)
- id, title, description, type, body_part, equipment, level, rating, rating_desc

**user_preferences**
- user_id, workout_days (3/4/5), preferred_equipment, avoided_body_parts

**workout_plans**
- id, user_id, week_start_date, workout_days, status (draft/active/completed)

**workout_sessions**
- id, plan_id, day_number, day_name, focus_body_parts

**session_exercises**
- id, session_id, exercise_id, order_index, sets, reps, completed, completed_at

**user_exercise_ratings**
- user_id, exercise_id, rating (0-5), notes

**exercise_history**
- user_id, exercise_id, session_exercise_id, completed_at, sets_completed, notes

---

## Exercise Scoring Algorithm (Implemented)

```typescript
Score =
  (User Rating OR Dataset Rating) × 20     // Max +100
  + Skill Level Match × 30                 // Exact match
  + Adjacent Level × 15                    // One level off
  + Equipment Preference × 20              // User's preferred
  + Common Equipment × 15                  // If no preference set
  - Recency Penalty × 50                   // Used in last 7 days
  + Exercise Type Bonus × 10               // Strength preferred
  + Olympic/Powerlifting × 5               // Secondary preference
  + Random Factor (0-15)                   // Variety
```

---

## Frontend Routing (Implemented)

```
/                 -> LandingPage (public, redirects to /home if logged in)
/login            -> LoginPage
/register         -> RegisterPage
/home             -> HomePage (current week workout or empty state) [protected]
/home/generate    -> GeneratePage (create new plan) [protected]
/home/history     -> HistoryPage (past workouts, stats) [protected]
/home/profile     -> ProfilePage (settings & preferences) [protected]
/home/help        -> HelpPage (user guide) [protected]
```

---

## Development Notes

### Seed User
- Username: `super`
- Password: `pass123`
- Skill Level: Intermediate
- Created by: `npm run db:seed`

### Known Issues Fixed
1. **better-sqlite3 compilation error** - Switched to sql.js (pure JS)
2. **last_insert_rowid() returning 0** - Fixed by calling before saveDatabase()
3. **TypeScript type issues** - Fixed BindParams and JWT SignOptions types

### Running the Application
1. Start backend: `cd backend && npm run dev` (port 3001)
2. Start frontend: `cd frontend && npm run dev` (port 5173/5174)
3. Frontend proxies `/api` requests to backend
4. Login with `super` / `pass123`

---

## Future Enhancements (Post-MVP)

- PWA with offline support
- Exercise videos/GIFs
- Custom workout builder
- Social features (share workouts)
- Exercise substitutions
- Workout timer
- Progress photos
- Body measurements
- Nutrition tracking
- Dark mode
