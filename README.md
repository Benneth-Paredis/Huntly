# 💼 JobTrack

A full-stack job application tracker with a Kanban board, built as a practical showcase of modern web development practices.

**Live demo:** _coming soon_ · **[View source](https://github.com/yourusername/job-tracker)**

![JobTrack screenshot](https://via.placeholder.com/900x500/0f172a/60a5fa?text=Add+a+screenshot+here)

---

## Overview

JobTrack lets you manage a job search the way engineers manage work — with a Kanban board, persistent data, and a clean API. Applications move through stages (Wishlist → Applied → Interview → Offer / Rejected), with a card list on mobile and a drag-and-drop board on desktop.

Built because spreadsheets are a poor substitute for purpose-built tooling, even for something as personal as a job search.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript | Component model and type safety at scale |
| Styling | Tailwind CSS | Utility-first; rapid iteration without context switching |
| Drag & Drop | dnd-kit | Modern, accessible, pointer-event based |
| Build tool | Vite | Sub-second HMR; far faster than Webpack |
| Backend | Bun + Express | Native TypeScript support and runtime speed without a compile step |
| ORM | Prisma | Type-safe database queries generated from schema; migrations as code |
| Database | PostgreSQL | Relational model suits the data; industry standard |
| Auth | JWT | Stateless, portable, well-understood |

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐
│   React Frontend    │  HTTP  │    Express REST API       │
│                     │◄──────►│                          │
│  - AuthContext      │        │  POST /api/auth/register │
│  - useJobs hook     │        │  POST /api/auth/login    │
│  - KanbanBoard      │        │  GET  /api/jobs          │
│  - JobList (mobile) │        │  POST /api/jobs          │
└─────────────────────┘        │  PATCH /api/jobs/:id     │
                                │  DELETE /api/jobs/:id    │
                                └──────────┬───────────────┘
                                           │ Prisma
                                ┌──────────▼───────────────┐
                                │       PostgreSQL          │
                                │   users · jobs            │
                                └──────────────────────────┘
```

**Key decisions:**

**Optimistic updates on the Kanban board.** When a card is dragged to a new column, the UI updates immediately without waiting for the API response. If the server request fails, the state reverts. This keeps the board feeling instant.

**Responsive layout strategy.** Rather than cramming a Kanban board onto a small screen, mobile renders a card-based list and the board only appears at `md` breakpoints and above — one codebase, two appropriate experiences.

**Bun as runtime and package manager.** `bun install` is significantly faster than npm in practice. The runtime executes TypeScript natively, removing ts-node and nodemon from the dev stack entirely. Express runs unchanged — Bun is a drop-in Node replacement.

**Prisma over raw SQL.** The schema is the single source of truth. Migrations are generated automatically, and every database call is fully typed — no manual casting or runtime surprises from query results.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- PostgreSQL (local or [Neon.tech](https://neon.tech) for a free cloud instance)

### Backend

```bash
cd backend
bun install
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
bun db:generate
bun db:migrate
bun dev                # → http://localhost:3001
```

### Frontend

```bash
cd frontend
bun install
cp .env.example .env
bun dev                # → http://localhost:5173
```

---

## Project Structure

```
job-tracker/
├── backend/
│   ├── prisma/schema.prisma      # Database schema and relations
│   └── src/
│       ├── index.ts              # Express app entry point
│       ├── middleware/auth.ts    # JWT verification
│       └── routes/
│           ├── auth.ts           # Register / login
│           └── jobs.ts           # Job application CRUD
│
└── frontend/
    └── src/
        ├── context/AuthContext   # Session state (token, user)
        ├── hooks/useJobs.ts      # Data fetching and mutations
        ├── lib/api.ts            # Axios instance with auth injection
        ├── pages/
        │   ├── AuthPage.tsx      # Login / register
        │   └── Dashboard.tsx     # Main application view
        └── components/
            ├── KanbanBoard.tsx   # Drag-and-drop board (desktop)
            ├── JobList.tsx       # Card list (mobile)
            ├── JobForm.tsx       # Add / edit modal
            └── StatusBadge.tsx   # Coloured status pill
```

---

## Roadmap

- [ ] Stats dashboard — applications per week, stage conversion rates
- [ ] Interview timeline — calendar view of upcoming interviews
- [ ] Contacts per application — recruiter names, emails, notes
- [ ] CSV export
- [ ] Email reminders for follow-up dates
- [ ] Deploy — Railway (API) + Vercel (frontend)

---

## License

MIT
