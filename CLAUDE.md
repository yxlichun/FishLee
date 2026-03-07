# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Product Manager learning path management website - a single-page app for tracking a 6-month AI PM career transition plan. Includes learning progress tracking, daily check-ins, Markdown notes, and resource bookmarking.

## Development Commands

All commands run from `website/` directory:

```bash
cd website
npm run dev        # Start Vite dev server at http://localhost:5173
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview production build
npx tsc --noEmit   # Type check only (no tests configured)
```

Note: npm cache has a permissions issue on this machine. If `npm install` fails, use: `npm install --cache /tmp/npm-cache`

## Architecture

**Stack**: React 19 + TypeScript + Vite 6 + Tailwind CSS 3 + Zustand 5

**Routing**: React Router 7 with a shared `Layout` component wrapping all pages via `<Outlet />`. Routes defined in `App.tsx`. Root `/` redirects to `/dashboard`.

**State Management**: Single Zustand store (`src/store.ts`) with `persist` middleware auto-syncing to localStorage (key: `ai-pm-learning-storage`). The store holds all user data (task progress, check-ins, notes, bookmarks) and exposes JSON export/import for backup.

**Data Model**: Static learning path content lives in `src/data/learningPath.ts` as a typed array of 6 phases, each containing sections with tasks and resources. User progress is stored separately in the Zustand store as a `Record<string, boolean>` mapping task IDs to completion state.

**Styling**: Tailwind CSS with a custom `brand` color palette (blue tones, 50-900). Reusable utility classes defined in `src/index.css` (`@layer components`): `.card`, `.btn-primary`, `.btn-secondary`, `.sidebar-link`. Uses `@tailwindcss/typography` plugin for Markdown prose rendering.

## Key Conventions

- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
- All types in `src/types.ts` - import from there, don't redeclare
- IDs generated via `Date.now().toString()` for notes and bookmarks
- Markdown rendering uses `react-markdown` with Tailwind `prose` classes
- Charts use `recharts` (dashboard only)
- Icons from `lucide-react`
- UI language is Chinese (zh-CN)
