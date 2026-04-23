# Fenmo Expense Tracker

Minimal full-stack Expense Tracker built for the assignment.  
The project focuses on correctness under real-world conditions (retries, refreshes, slow/failing requests), clean structure, and maintainability.

## What Was Implemented (Assignment Coverage)

### Required - Backend

- `POST /api/expenses` to create an expense with `amount`, `category`, `description`, `date`
- `GET /api/expenses` to list expenses
- Optional query support:
  - `category` for filtering
  - `sort=date_desc` for newest-first sorting
- Durable persistence using SQLite
- Data model includes:
  - `id`
  - `amount` (stored as integer paise for money correctness)
  - `category`
  - `description`
  - `date`
  - `created_at`

### Required - Frontend

- Expense form to submit `amount`, `category`, `description`, `date`
- Expense table/list of existing expenses
- Filter by category
- Sort by newest date
- Total for currently visible list

### Nice-to-Have Implemented

- Validation (backend Zod validation, invalid request handling)
- Category summary view in UI
- Basic automated tests (`backend/tests/expenses.test.js`)
- Loading and error UX states
- Retry-safe behavior via idempotent create flow

## Architecture and Tech Stack

- Frontend: React, TypeScript, Redux Toolkit, Vite, Tailwind CSS, Material UI, React Toastify, Framer Motion
- Backend: Node.js, Express, SQLite, Zod, Swagger
- Structure:
  - `frontend/` - React app
  - `backend/` - Express app (routes/controllers/services/models/middleware)

## API Documentation (Swagger)

- Swagger UI URL: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- Health check: [http://localhost:4000/health](http://localhost:4000/health)

Swagger is generated from route JSDoc annotations and available after backend startup.

## API Reference

### 1) Create Expense

- Method: `POST`
- URL: `/api/expenses`
- Headers:
  - `Content-Type: application/json`
  - `Idempotency-Key: <unique-key>` (optional but recommended)

Request body:

```json
{
  "amount": "499.99",
  "category": "Groceries",
  "description": "Weekly household purchase",
  "date": "2026-04-22"
}
```

Behavior:

- `201` when newly created
- `200` when same idempotency key + same payload is replayed
- `409` if idempotency key is re-used with a different payload

### 2) List Expenses

- Method: `GET`
- URL: `/api/expenses`
- Query params:
  - `category` (optional)
  - `sort=date_desc` (optional)

Example:

- `/api/expenses`
- `/api/expenses?category=Groceries`
- `/api/expenses?sort=date_desc`
- `/api/expenses?category=Groceries&sort=date_desc`

Response includes:

- `data`: array of expenses
- `meta.total`: total amount of current visible list

## Why These Design Decisions

- SQLite was chosen for durable local persistence with minimal setup and production-like behavior compared to in-memory storage.
- Money is stored as integer paise (`amount_paise`) to avoid floating-point precision issues.
- Idempotency is implemented for create requests to make retries safe under unstable network conditions.
- MVC + service layering improves maintainability and keeps concerns separated.
- Zod validation keeps request contracts explicit and consistent.

## Timebox Trade-offs

- No auth/authz or user accounts
- No background workers/caching/queues
- Test scope kept focused on core API behavior
- Single local environment setup (no containerization in this submission)

## What Was Intentionally Not Done

- CSV import/export
- Advanced analytics dashboard
- Multi-user support and role management
- Cloud deployment pipeline (local-first submission)

## How to Run

## Prerequisites

- Node.js 18+
- npm 9+

### 1) Install Dependencies

From repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2) Configure Environment (Backend)

Copy or create backend env values:

```bash
cp backend/.env.example backend/.env
```

Default values:

- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`

### 3) Run Both Apps Together (Recommended)

From root:

```bash
npm run dev
```

This starts:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

### 4) Run Backend and Frontend Separately

Backend:

```bash
npm run dev --prefix backend
```

Frontend:

```bash
npm run dev --prefix frontend
```

### 5) Run Tests

Backend tests:

```bash
npm test --prefix backend
```

## Quick Verification Checklist

- Open frontend: [http://localhost:5173](http://localhost:5173)
- Create an expense from the form
- Confirm row appears in expense table
- Apply category filter and date sort
- Confirm "Total" updates for visible rows
- Open Swagger and test APIs: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
