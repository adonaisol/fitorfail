# FitOrFail Implementation Plan

## Overview
Full-stack fitness application that automatically generates personalized weekly workout plans (3/4/5 day splits) using a dataset of 2,918 exercises. Users can rate exercises, track history, and refresh plans.

## Technology Stack
- **Backend**: Express.js + SQLite + JWT authentication
- **Frontend**: React + Tailwind CSS (mobile-first)
- **Dataset**: 2,918 exercises from `dataset/allExercises.json`

---

## Project Structure (Monorepo)

```
fitorfail/
├── backend/
│   ├── src/
│   │   ├── config/            # DB config, env variables
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── services/          # Core services (workout generation, auth)
│   │   └── server.js
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── fitorfail.db
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # Auth & Workout contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API client
│   │   └── App.jsx
│   └── package.json
└── dataset/                   # Existing exercise data
```

---

## Database Schema

### Core Tables

**users**
- id, username, password_hash, skill_level (Beginner/Intermediate/Expert)
- Stores user credentials and preferences

**exercises** (imported from dataset)
- id, title, description, type, body_part, equipment, level, rating
- 2,918 exercises from allExercises.json

**user_preferences**
- user_id, workout_days (3/4/5), preferred_equipment, avoided_body_parts
- User's workout configuration

**workout_plans**
- id, user_id, week_start_date, workout_days, status (draft/active/completed)
- Weekly workout plan container

**workout_sessions**
- id, plan_id, day_number, day_name, focus_body_parts
- Individual workout days (e.g., "Day 1: Push Day")

**session_exercises**
- id, session_id, exercise_id, order_index, sets, reps, completed
- Exercises within each workout session

**user_exercise_ratings**
- user_id, exercise_id, rating (0-5), notes
- User's personal ratings (override dataset ratings)

**exercise_history**
- user_id, exercise_id, completed_at, sets_completed, notes
- Track completed exercises for history and algorithm

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info

### Workout Plans
- `POST /api/workouts/generate` - Generate new weekly plan (draft)
- `GET /api/workouts/current` - Get active workout plan
- `PUT /api/workouts/:id/activate` - Activate a draft plan
- `POST /api/workouts/:id/refresh` - Regenerate entire week
- `POST /api/workouts/sessions/:id/refresh` - Regenerate single day

### Exercise Management
- `GET /api/exercises` - Get exercises with filters
- `GET /api/exercises/:id` - Get exercise details
- `POST /api/exercises/:id/rate` - Rate an exercise

### Sessions & Completion
- `GET /api/sessions/:id` - Get session with exercises
- `PUT /api/sessions/:id/exercises/:exerciseId/complete` - Mark complete

### History
- `GET /api/history/exercises` - Exercise completion history
- `GET /api/history/stats` - Workout statistics

---

## Workout Generation Algorithm

### Core Logic (`workoutGeneratorService.js`)

1. **Load user context**: skill level, preferences, ratings, history
2. **Determine split strategy** based on workout days:
   - **3-day**: Full body splits
   - **4-day**: Upper/Lower split
   - **5-day**: Push/Pull/Legs + Arms + Shoulders
3. **For each day**:
   - Define primary body parts
   - Select 5-8 exercises using scoring algorithm
   - Order exercises (compound movements first)
4. **Create plan in database** with status="draft"

### Exercise Scoring System

```javascript
Score =
  (User Rating OR Dataset Rating) × 20     // Max +100
  + Skill Level Match × 30                 // Prefer appropriate level
  + Equipment Availability × 20            // User's equipment
  - Recency Penalty (0-50)                 // Avoid recent exercises
  + Exercise Type Bonus × 10               // Prefer Strength type
  + Random Factor (0-15)                   // Add variety
```

### Split Strategies

**5-Day Example:**
- Day 1: Push (Chest, Shoulders, Triceps) - 7 exercises
- Day 2: Pull (Back, Biceps) - 7 exercises
- Day 3: Legs (Quads, Hamstrings, Glutes, Calves) - 7 exercises
- Day 4: Arms & Core (Biceps, Triceps, Abs) - 7 exercises
- Day 5: Shoulders & Back Accessories - 6 exercises

**3-Day Example:**
- Day 1: Full Body A (Chest, Back, Legs)
- Day 2: Full Body B (Shoulders, Arms, Core)
- Day 3: Full Body C (Legs, Back, Chest)

**4-Day Example:**
- Day 1: Upper Push (Chest, Shoulders, Triceps)
- Day 2: Lower Body (Legs, Glutes, Calves)
- Day 3: Upper Pull (Back, Biceps)
- Day 4: Lower Body & Core

### Personalization Features

- **User ratings override dataset ratings** - Higher rated exercises appear more
- **Avoid recent exercises** - Don't repeat exercises within 7 days
- **Skill level filtering** - Match user's Beginner/Intermediate/Expert level
- **Equipment preferences** - Prioritize available equipment

---

## Frontend Architecture

### Key Components

**Layout**
- `Layout.jsx` - Main wrapper with Header and BottomNav
- `Header.jsx` - Top navigation
- `BottomNav.jsx` - Mobile bottom navigation

**Workout Views**
- `WeeklyPlanView.jsx` - Main view showing all workout days
- `DayCard.jsx` - Individual day card (swipeable on mobile)
- `ExerciseCard.jsx` - Exercise card with details and complete button
- `ExerciseDetail.jsx` - Modal with full exercise info
- `RefreshButton.jsx` - Refresh day or entire week

**Auth**
- `LoginForm.jsx` - Login form
- `RegisterForm.jsx` - Registration form

**Profile & Settings**
- `ProfileSettings.jsx` - User profile
- `PreferencesForm.jsx` - Set workout days (3/4/5), skill level, equipment

**History**
- `HistoryList.jsx` - Past workouts
- `StatsCard.jsx` - Statistics (total workouts, exercises completed)

**Common**
- `Button.jsx`, `Card.jsx`, `Loading.jsx`, `ErrorMessage.jsx`
- `RatingInput.jsx` - Star rating for exercises

### State Management

**React Context + Custom Hooks** (simpler than Redux for MVP)

1. **AuthContext** - User authentication state, login/logout
2. **WorkoutContext** - Current workout plan, refresh functions

### Routing

```
/                 -> HomePage (current week)
/login            -> LoginPage
/register         -> RegisterPage
/generate         -> PlanGeneratorPage (create new plan)
/history          -> HistoryPage (past workouts)
/profile          -> ProfilePage (settings & preferences)
```

### Mobile-First Design with Tailwind

- Default styles for mobile (no prefix)
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Touch-friendly targets (min 44px height)
- Card-based layout
- Large readable text (16px minimum)
- Bottom navigation for primary actions

---

## Implementation Phases

### Phase 1: Foundation Setup
**Files to create:**
- Backend: `server.js`, database schema, package.json
- Frontend: Vite React app, Tailwind config, basic Layout
- Seed exercises from `dataset/allExercises.json` into SQLite

**Deliverable:** Backend runs, database has exercises, frontend shows basic UI

### Phase 2: Authentication System
**Files to create:**
- Backend: `authService.js`, auth routes, JWT middleware
- Frontend: `AuthContext.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`, protected routes

**Deliverable:** Users can register, login, and access protected routes

### Phase 3: Workout Generation Engine
**Files to create:**
- `workoutGeneratorService.js` - Core algorithm with split strategies
- `workouts.js` routes - Generate, get, refresh endpoints
- Exercise scoring and selection logic

**Deliverable:** Backend generates balanced weekly workout plans

### Phase 4: Weekly Workout View
**Files to create:**
- `WorkoutContext.jsx` - Workout state management
- `WeeklyPlanView.jsx` - Main workout view
- `DayCard.jsx`, `ExerciseCard.jsx` - Display components
- API integration with loading states

**Deliverable:** Users can view their weekly workout plan

### Phase 5: Workout Management
**Features:**
- Refresh single day button
- Refresh entire week button
- Plan preview before activating
- Mark exercises as complete
- Visual feedback for completed items

**Deliverable:** Users can refresh plans and mark exercises complete

### Phase 6: User Preferences & Ratings
**Files to create:**
- Preferences endpoints (GET/PUT)
- `ProfilePage.jsx`, `PreferencesForm.jsx`
- `RatingInput.jsx` - Star rating component
- Update algorithm to use preferences and ratings

**Deliverable:** Users can set preferences, rate exercises, personalize workouts

### Phase 7: History & Analytics
**Features:**
- Record exercise completions
- Display past workouts
- Calculate statistics (workouts completed, favorite exercises)
- Algorithm avoids recent exercises

**Deliverable:** Users can view workout history and stats

### Phase 8: Polish & Testing
**Tasks:**
- Error handling and validation
- Loading states (skeletons)
- Success notifications
- Mobile testing on devices
- Bug fixes
- Update README and CLAUDE.md

**Deliverable:** Production-ready MVP

---

## Critical Files

**Most important files to implement:**

1. **`backend/src/services/workoutGeneratorService.js`**
   - Core algorithm: split strategies, exercise selection, scoring logic
   - Most complex business logic

2. **`backend/database/migrations/001_initial_schema.sql`**
   - All database tables, relationships, indexes
   - Foundation for entire backend

3. **`frontend/src/components/workout/WeeklyPlanView.jsx`**
   - Main UI component users interact with
   - Displays weekly plan, integrates all workout components

4. **`backend/src/routes/workouts.js`**
   - Workout API endpoints (generate, refresh, get)
   - Connects algorithm to frontend

5. **`dataset/allExercises.json`** (already exists)
   - 2,918 exercises to import into database

---

## Dependencies

**Backend:**
```json
{
  "express": "^4.18.2",
  "better-sqlite3": "^9.2.2",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1",
  "morgan": "^1.10.0"
}
```

**Frontend:**
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.5",
  "lucide-react": "^0.294.0",
  "react-hot-toast": "^2.4.1"
}
```

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
