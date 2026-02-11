# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Rules

- Do not change project structure unless explicitly asked
- Do not introduce new libraries or frameworks unless explicitly approved
- Make minimal, incremental changes
- Tech stack is fixed: React 18 + TypeScript + Vite + Tailwind CSS (frontend), Bun + Express + TypeScript (backend), Prisma ORM, PostgreSQL (Docker), JWT auth

## Project Overview

JobTrack is a full-stack job application tracker with a Kanban board interface. Monorepo with two apps under `apps/`:

- **`apps/api`** — Express backend running on **Bun**, with Prisma ORM and PostgreSQL
- **`apps/web`** — React 18 + TypeScript frontend built with **Vite** + Tailwind CSS

The project is in early-stage development — backend has only a health check endpoint, frontend is Vite boilerplate, and the Prisma schema has no models yet.

## Commands

### Frontend (`apps/web`)

```bash
bun install                # install dependencies
bun run dev                # dev server at http://localhost:5173
bun run build              # type-check (tsc -b) then vite build
bun run lint               # eslint .
bun run preview            # preview production build
```

### Backend (`apps/api`)

```bash
bun install                # install dependencies
bun run index.ts           # start server at http://localhost:3001
```

### Database (from `apps/api`)

```bash
bunx prisma generate       # generate Prisma client (outputs to src/generated/prisma)
bunx prisma migrate dev    # run migrations
```

No test framework is configured yet.

## Architecture

- **Runtime**: Bun everywhere (package management, TypeScript execution, no transpilation step needed for backend)
- **Database**: PostgreSQL via Prisma. Schema at `apps/api/prisma/schema.prisma`, config at `apps/api/prisma.config.ts`. Generated client outputs to `apps/api/generated/prisma`
- **Auth**: JWT-based (jsonwebtoken installed, not yet implemented)
- **Frontend build**: Vite with `@vitejs/plugin-react`. ESLint 9 flat config with react-hooks and react-refresh plugins
- **Planned patterns** (from README): optimistic UI updates for Kanban board, responsive layout (mobile card list / desktop drag-and-drop via dnd-kit), Tailwind CSS for styling

## Environment

Backend expects these env vars in `apps/api/.env`:

- `PORT` (default 3001)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET`
