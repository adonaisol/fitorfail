# FitOrFail

A full-stack fitness application that automatically generates personalized weekly workout plans. Built with React, Express, and TypeScript.

## Features

- **Personalized Workout Plans**: Generate 3, 4, or 5-day workout splits based on your fitness level
- **2,918 Exercises**: Comprehensive exercise database with detailed descriptions and equipment info
- **Smart Exercise Selection**: Algorithm considers your skill level, equipment preferences, and exercise history
- **Progress Tracking**: Mark exercises as complete and track your workout history
- **Exercise Ratings**: Rate exercises to personalize future workout recommendations
- **Streak Tracking**: Monitor your workout consistency with daily streaks
- **Replace Single Exercise**: Swap out any individual exercise with a smart replacement targeting the same body part
- **Partial Refresh**: Refresh only uncompleted exercises while preserving your progress

## Tech Stack

### Backend
- **Express.js** - API server
- **TypeScript** - Type safety
- **sql.js** - SQLite database (pure JavaScript)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitorfail.git
cd fitorfail
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Seed the database (first time only):
```bash
cd ../backend
npm run db:seed
```

### Running the Application

1. Start the backend server (port 3001):
```bash
cd backend
npm run dev
```

2. Start the frontend dev server (port 5173):
```bash
cd frontend
npm run dev
```

3. Open http://localhost:5173 in your browser

### Default Login
- Username: `super`
- Password: `pass123`

## Project Structure

```
fitorfail/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Express server
│   └── database/
│       ├── migrations/     # SQL schema
│       └── seeds/          # Data seeding
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Auth and Workout contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── index.html
└── dataset/                # Exercise data (JSON/CSV)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Workouts
- `POST /api/workouts/generate` - Generate new plan
- `GET /api/workouts/current` - Get active plan
- `PUT /api/workouts/:id/activate` - Activate a plan
- `POST /api/workouts/:id/refresh` - Refresh all exercises
- `POST /api/workouts/:planId/days/:dayNumber/refresh` - Refresh day
- `POST /api/workouts/:planId/days/:dayNumber/refresh-uncompleted` - Refresh only uncompleted
- `PUT /api/workouts/exercises/:id/complete` - Mark complete
- `PUT /api/workouts/exercises/:id/uncomplete` - Undo completion
- `POST /api/workouts/exercises/:id/replace` - Replace single exercise

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `GET /api/preferences/options` - Get available options

### Stats
- `GET /api/stats` - Get user statistics
- `GET /api/stats/history` - Get workout history

### Exercise Ratings
- `POST /api/exercises/:id/rate` - Rate an exercise
- `GET /api/exercises/:id/rating` - Get user rating
- `DELETE /api/exercises/:id/rating` - Remove rating

## Workout Splits

### 3-Day Split
- Day 1: Full Body A (Push Focus)
- Day 2: Full Body B (Pull Focus)
- Day 3: Full Body C (Legs & Core)

### 4-Day Split
- Day 1: Upper Push
- Day 2: Lower Body
- Day 3: Upper Pull
- Day 4: Lower Body & Core

### 5-Day Split
- Day 1: Push Day
- Day 2: Pull Day
- Day 3: Legs
- Day 4: Arms & Core
- Day 5: Shoulders & Back

## Exercise Scoring Algorithm

The workout generator uses a scoring system to select appropriate exercises:

```
Score =
  (User Rating OR Dataset Rating) x 20   // Max +100
  + Skill Level Match x 30               // Exact match
  + Adjacent Level x 15                  // One level off
  + Equipment Preference x 20            // User's preferred
  + Common Equipment x 15                // If no preference
  - Recency Penalty x 50                 // Used in last 7 days
  + Exercise Type Bonus x 10             // Strength preferred
  + Random Factor (0-15)                 // Variety
```

## Database Schema

- **users** - User accounts and skill levels
- **exercises** - 2,918 exercises from dataset
- **user_preferences** - Workout preferences
- **workout_plans** - Weekly plans (draft/active/completed/cancelled)
- **workout_sessions** - Individual workout days
- **session_exercises** - Exercises within sessions
- **user_exercise_ratings** - Personal exercise ratings
- **exercise_history** - Completion records

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
