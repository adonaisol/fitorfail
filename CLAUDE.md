# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitOrFail is a fitness application that automatically generates personalized weekly workout plans (3/4/5 day splits) using a dataset of 2,918 exercises. Users can rate exercises, track history, and refresh/customize their plans.

## Technology Stack

- **Backend**: Express.js + sql.js (SQLite) + JWT authentication
- **Frontend**: React + Vite + Tailwind CSS (mobile-first)
- **Dataset**: 2,918 exercises in `dataset/allExercises.json`

## Development Commands

### Backend (from `/backend` directory)

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Start production server
npm start

# Initialize/reset database
npm run db:init

# Seed exercises into database
npm run db:seed
```

### Frontend (from `/frontend` directory)

```bash
# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
fitorfail/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and env configuration
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API endpoint handlers
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Core services (workout generation)
│   │   └── server.js       # Express app entry point
│   ├── database/
│   │   ├── migrations/     # SQL schema files
│   │   ├── seeds/          # Database seeding scripts
│   │   └── fitorfail.db    # SQLite database file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (layout, auth, workout, etc.)
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React Context (auth, workout state)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client functions
│   │   └── App.jsx
│   └── package.json
├── dataset/                # Exercise data (CSV and JSON)
└── plans/                  # Implementation plan documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info

### Exercises
- `GET /api/exercises` - Get exercises with filters (bodyPart, equipment, level, type)
- `GET /api/exercises/filters` - Get available filter options
- `GET /api/exercises/:id` - Get single exercise
- `POST /api/exercises/:id/rate` - Rate an exercise

### Workout Plans
- `POST /api/workouts/generate` - Generate new weekly plan
- `GET /api/workouts/current` - Get active workout plan
- `POST /api/workouts/:id/refresh` - Regenerate entire week
- `POST /api/workouts/sessions/:id/refresh` - Regenerate single day

## Database Schema

Key tables:
- `users` - User credentials and skill level
- `exercises` - 2,918 exercises imported from dataset
- `user_preferences` - Workout days (3/4/5), equipment preferences
- `workout_plans` - Weekly workout plans with status (draft/active/completed)
- `workout_sessions` - Individual workout days
- `session_exercises` - Exercises within each session
- `user_exercise_ratings` - Personal ratings (override dataset ratings)
- `exercise_history` - Track completed exercises

## Exercise Data Structure

Each exercise in the dataset:
```json
{
  "id": number,
  "title": string,
  "description": string,
  "type": string (Strength, Cardio, etc.),
  "bodyPart": string (Chest, Back, Legs, etc.),
  "equipment": string (Barbell, Dumbbell, Body Only, etc.),
  "level": string (Beginner/Intermediate/Expert),
  "rating": number | null,
  "ratingDesc": string | null
}
```

## Implementation Status

- [x] Phase 1: Foundation Setup (Backend, Frontend, Database)
- [ ] Phase 2: Authentication System
- [ ] Phase 3: Workout Generation Engine
- [ ] Phase 4: Weekly Workout View
- [ ] Phase 5: Workout Management (Refresh, Complete)
- [ ] Phase 6: User Preferences & Ratings
- [ ] Phase 7: History & Analytics
- [ ] Phase 8: Polish & Testing
