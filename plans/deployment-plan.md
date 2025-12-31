# FitOrFail Build & Deployment Pipeline Plan

## Current State

### Frontend (Vite-based)
- **Build tool**: Vite 5.0.0 with React plugin
- **Scripts**: `npm run build` → `tsc && vite build`
- **Output**: Bundled/minified files in `dist/`
- **Dev**: Vite dev server on port 5173 with API proxy to :3001

### Backend (tsc-based)
- **Build tool**: TypeScript compiler (tsc)
- **Scripts**: `npm run build` → `tsc`
- **Output**: Compiled JS files in `dist/`
- **Dev**: `tsx watch` for hot reloading

### Root Level
- No root package.json
- Shared tsconfig.json with project references
- Separate workspaces (not npm/yarn workspaces)

---

## Proposed Changes

### Goal
Create a unified build pipeline using esbuild at the root level to build both frontend and backend services.

### Root Package Setup

Create `/package.json` at root with:
```json
{
  "name": "fitorfail",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "node scripts/build.js",
    "build:frontend": "node scripts/build-frontend.js",
    "build:backend": "node scripts/build-backend.js",
    "start": "node dist/backend/server.js",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "esbuild": "^0.20.0",
    "concurrently": "^8.2.2"
  }
}
```

### Build Script Architecture

#### `/scripts/build.js` - Main build orchestrator
- Runs frontend and backend builds in parallel
- Handles errors and reports build status
- Outputs to `/dist/` directory

#### `/scripts/build-frontend.js` - Frontend build
- Uses esbuild to bundle React app
- Handles JSX transformation
- Processes CSS (with Tailwind via PostCSS)
- Copies static assets from `public/`
- Outputs to `/dist/frontend/`

#### `/scripts/build-backend.js` - Backend build
- Uses esbuild to bundle Node.js server
- Bundles all dependencies (optional: external node_modules)
- Handles ES modules format
- Copies database migrations/seeds
- Outputs to `/dist/backend/`

### Output Structure
```
dist/
├── frontend/           # Static files to serve
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── icon.png, logo.png
└── backend/
    ├── server.js       # Bundled server
    └── database/       # Migrations & seeds
```

---

## Implementation Steps

### Phase 1: Root Setup
1. Create root `package.json`
2. Install esbuild and concurrently
3. Create `/scripts/` directory

### Phase 2: Backend Build Script
1. Create `scripts/build-backend.js`
2. Configure esbuild for Node.js target
3. Handle external dependencies (sql.js, bcrypt native modules)
4. Copy database files
5. Test build output

### Phase 3: Frontend Build Script
1. Create `scripts/build-frontend.js`
2. Configure esbuild for browser target
3. Handle React JSX
4. Process Tailwind CSS
5. Generate index.html with hashed assets
6. Copy public assets
7. Test build output

### Phase 4: Main Build Script
1. Create `scripts/build.js`
2. Orchestrate parallel builds
3. Add error handling and logging
4. Verify output structure

### Phase 5: Production Server Updates
1. Update backend to serve frontend static files in production
2. Add environment-based configuration
3. Test full production build

---

## Key Files to Modify/Create

**Create:**
- `/package.json` (root)
- `/scripts/build.js`
- `/scripts/build-frontend.js`
- `/scripts/build-backend.js`

**Modify:**
- `/backend/src/server.ts` - Add static file serving for production

---

## Technical Considerations

### esbuild Configuration for Backend
```javascript
{
  entryPoints: ['backend/src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/backend/server.js',
  external: ['sql.js', 'bcrypt'], // Native modules
  sourcemap: true
}
```

### esbuild Configuration for Frontend
```javascript
{
  entryPoints: ['frontend/src/main.tsx'],
  bundle: true,
  platform: 'browser',
  target: ['es2020'],
  format: 'esm',
  outdir: 'dist/frontend/assets',
  splitting: true,
  minify: true,
  sourcemap: true,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: { 'process.env.NODE_ENV': '"production"' }
}
```

### Tailwind CSS Handling
Options:
1. Use PostCSS plugin with esbuild
2. Pre-build CSS with Tailwind CLI
3. Use esbuild-plugin-tailwindcss

Recommended: Pre-build with Tailwind CLI for simplicity

---

## Decisions Made

1. **Dev workflow**: Keep Vite for frontend development (HMR), use esbuild only for production builds
2. **Backend bundling**: Keep node_modules external (smaller bundle, requires deps in production)
3. **Deployment target**: Cloud platform (Render, Railway, etc.) - simple build output

---

## Cloud Deployment Configuration

### For Render/Railway

**Build Command**: `npm run build`
**Start Command**: `npm start`

The build will output:
- Frontend static files served by the backend
- Backend serves API + static frontend in production

### Environment Variables
- `NODE_ENV=production`
- `PORT` (provided by platform)
- `JWT_SECRET` (set in platform dashboard)

---

## Final File List

**Create:**
1. `/package.json` - Root package with build scripts
2. `/scripts/build.js` - Main build orchestrator
3. `/scripts/build-frontend.js` - Frontend esbuild config
4. `/scripts/build-backend.js` - Backend esbuild config

**Modify:**
1. `/backend/src/server.ts` - Serve static frontend files in production
