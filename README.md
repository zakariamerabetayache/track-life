# Truck Life (Track Life)

**Truck Life** is a personal productivity web application that helps you track the parts of your life that matter most. Monitor daily tasks, weekly goals, work hours, sleep, habits, and personal productivity metrics — all in one place.

## Why I Built It

Everyone wants to be more productive but many of us struggle with procrastination and lack of clarity. If you can't measure something, it's hard to improve it.

I built Truck Life to answer simple but powerful questions about my daily routine:

- How many hours did I actually work today?
- Am I sleeping enough?
- Am I building good habits or repeating bad ones?

With accurate data about your days, decisions stop being guesses and become choices.

## Philosophy

This app doesn't promise to fix your life for you. It shows you the truth. When you can clearly see your habits, sleep, productivity, and streaks, you naturally make better decisions.

## Features

- Track daily task completion and occurrences
- Define and monitor weekly goals
- Record and analyse sleep duration and schedule
- Track work hours and time blocks
- Habit tracking with streaks (good and bad habits)
- Productivity & trend charts
- CRUD for categories, goals, weeks, day goals, completions
- Simple REST API (Express + Prisma)

## Screenshots

Main dashboard and weekly views — screenshots taken from the app (found in `frontend/public/img`):

![Weekly view](frontend/public/img/ShowCurrentWeekWithWeklyGoals04.PNG)
![Track overview 1](frontend/public/img/tarck1.PNG)
![Track overview 2](frontend/public/img/track02.PNG)
![Day tasks view](frontend/public/img/trackShowDayTasks03.PNG)

## Tech Stack

- Frontend: Next.js (React 19), Tailwind CSS, shadcn components, Recharts
- Backend: Node.js, Express
- ORM: Prisma (PostgreSQL datasource)
- Database: PostgreSQL (configured via `DATABASE_URL`)
- Dev tooling: ESLint, PostCSS, Tailwind

Key packages (see package.json files):

- `frontend`: `next`, `react`, `tailwindcss`, `recharts`, `shadcn`
- `backend`: `express`, `prisma`, `@prisma/client`, `pg`, `dotenv`, `zod`

## Installation (local)

Prerequisites:

- Node.js (v18+ recommended)
- PostgreSQL (or a compatible provider) and a `DATABASE_URL`

1. Clone the repo and open two terminals.

Backend setup:

```bash
cd backend
npm install
# create a .env with your DATABASE_URL and other vars
# generate Prisma client and push schema to DB
npx prisma generate
npx prisma db push
# seed the DB (if needed)
npx prisma db seed
npm run dev
```

Frontend setup:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

By default the backend listens on `PORT` (default: `3001`). Point the frontend API base to the backend, for example:

- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## Environment variables

At minimum configure the following for local development (create a `backend/.env`):

- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — backend port (optional; default 3001)

Frontend environment variables (optional):

- `NEXT_PUBLIC_API_URL` — full URL to the backend API (e.g. `http://localhost:3001/api`)

## API Overview

The backend exposes a small REST API under `/api`:

- `GET /api/health` — health check
- `GET/POST/PUT/DELETE /api/goals`
- `GET/POST/PUT/DELETE /api/weeks`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/day-goals`
- `GET/POST/PUT/DELETE /api/completions`
- `GET/POST/PUT/DELETE /api/week-goals`

See the route handlers in `backend/src/routes` for request/response shapes.

## Development notes

- The backend uses Prisma with a PostgreSQL datasource (see `backend/prisma/schema.prisma`).
- Logging is minimal and prints incoming requests with timestamps.
- Request body size is limited to 10kb in the backend to avoid oversized payloads.

## Contributing

- Fork the repo, create a feature branch, and open a PR.
- Keep changes focused and update/add tests where appropriate.

If you'd like, I can open a PR for formatting, add a license, or create a CI pipeline.

## License

This project does not include a license file. If you want an open license, I can add `MIT` or another license of your choice.

---

If you'd like any revisions (tone, length, extra sections such as deployment, CI, or a getting-started video), tell me which sections to expand and I will update the README. I can also commit a `LICENSE` file and push the change if you want.
