# Fenmo Expense Tracker (Enterprise-style)

Minimal full-stack expense tracker built from the assignment brief, with production-style structure and reliability behaviors.

## Stack

- Frontend: React + TypeScript + Redux Toolkit + Vite + Tailwind CSS + Material UI + React Toastify + Framer Motion
- Backend: Node.js + Express (MVC) + SQLite + Zod validation + Swagger docs

## Project Structure

- `frontend/` React application
- `backend/` Express API in MVC layout
  - `src/server.js` server bootstrap
  - `src/app.js` app composition
  - `src/routes` route layer
  - `src/controllers` controller layer
  - `src/services` business logic layer
  - `src/models` data access layer
  - `src/middleware` middleware layer
  - `src/validators` validation schemas
  - `src/docs` Swagger setup

## Features Covered

- Create expense: amount, category, description, date
- List expenses
- Filter by category
- Sort by date (newest first)
- Visible-list total amount
- Loading/error UX states
- Category-wise summary view
- Retry-safe create flow via idempotency key support
- Dark/light theme toggle
- Responsive layout
- UI transitions with Framer Motion

## API

- `POST /api/expenses`
- `GET /api/expenses?category=...&sort=date_desc`
- Health: `GET /health`
- Swagger UI: `GET /api/docs`

## Run Locally

Install all dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Start both apps:

```bash
npm run dev
```

Run backend tests:

```bash
npm test --prefix backend
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

## Design Decisions

- **Persistence choice**: SQLite for durable local persistence, no external infrastructure, and deterministic behavior.
- **Money correctness**: backend stores money as `amount_paise` integer, then formats to 2-decimal strings for responses.
- **Idempotency**: backend stores `Idempotency-Key` + request hash + expense mapping to safely handle retries and prevent duplicate writes.
- **Validation**: request shape and constraints are enforced via Zod in middleware.
- **Layering**: API uses MVC + service layer separation for long-term maintainability.

## Trade-offs (Timebox)

- No authentication/authorization implemented.
- No background jobs, caching, or queue systems added.
- Kept test scope small (core API integration coverage only) due to timebox.

## Intentionally Not Done

- CSV export/import
- Advanced analytics dashboards
- Multi-user account model
