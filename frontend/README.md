# Fenmo Frontend

React + TypeScript frontend for the Fenmo Expense Tracker.

## Environment Setup

Create a `.env` file inside `frontend/`:

```bash
cp .env.example .env
```

Add the backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

If `.env.example` is not present, create `.env` manually with the same key.

## Run Frontend

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Backend URL Used by Frontend

- Local backend base URL: `http://localhost:4000/api`
- Health endpoint: `http://localhost:4000/health`
- Swagger endpoint: `http://localhost:4000/api/docs`

The frontend reads `VITE_API_BASE_URL` and defaults to `http://localhost:4000/api` if not set.
