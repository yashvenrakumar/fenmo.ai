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
- Production Swagger URL: [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api/docs](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api/docs)
- Production health URL: [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/health](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/health)

Swagger is generated from route JSDoc annotations and available after backend startup.

## Deployed URLs (EC2)

- Frontend (HTTPS): [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com)
- Backend base (HTTPS via Nginx): [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api)
- Backend health (HTTPS): [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/health](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/health)
- Swagger docs (HTTPS): [https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api/docs](https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api/docs)

Deployment note:

- HTTPS is enabled using a self-signed certificate because Let's Encrypt does not issue certificates for `*.compute.amazonaws.com` hostnames. Browsers will show a security warning unless you use a custom domain with a trusted CA certificate.

## AWS EC2 Deployment Process (Backend + Frontend + Nginx)

### 1) Launch and connect to EC2

- Launch an Amazon Linux EC2 instance.
- Ensure security group allows:
  - `22` (SSH)
  - `80` (HTTP)
  - `443` (HTTPS)
- Connect using the PEM key:

```bash
chmod 400 "fenmo.pem"
ssh -i "fenmo.pem" ec2-user@ec2-13-200-246-7.ap-south-1.compute.amazonaws.com
```

### 2) Copy project to EC2

From local machine:

```bash
rsync -az --delete --exclude '.git' --exclude 'node_modules' \
  -e "ssh -i fenmo.pem" ./ ec2-user@ec2-13-200-246-7.ap-south-1.compute.amazonaws.com:~/fenmo/
```

### 3) Install runtime dependencies on EC2

```bash
sudo dnf install -y gcc-c++ make nginx certbot python3-certbot-nginx
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2
```

### 4) Start backend with PM2

```bash
cd ~/fenmo/backend
npm install
cat > .env <<'EOF'
PORT=4000
CORS_ORIGIN=https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com
EOF
pm2 start src/server.js --name fenmo-backend
pm2 save
```

### 5) Build frontend for production

```bash
cd ~/fenmo/frontend
npm install
cat > .env <<'EOF'
VITE_API_BASE_URL=https://ec2-13-200-246-7.ap-south-1.compute.amazonaws.com/api
EOF
npm run build
sudo mkdir -p /var/www/fenmo
sudo rsync -a --delete ~/fenmo/frontend/dist/ /var/www/fenmo/
sudo chown -R nginx:nginx /var/www/fenmo
```

### 6) Configure Nginx

Create `/etc/nginx/conf.d/fenmo.conf`:

```nginx
server {
    listen 80;
    server_name ec2-13-200-246-7.ap-south-1.compute.amazonaws.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name ec2-13-200-246-7.ap-south-1.compute.amazonaws.com;

    ssl_certificate /etc/nginx/ssl/fenmo-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/fenmo-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/fenmo;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:4000/health;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Then enable/restart Nginx:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 7) SSL certificate note

- Current deployment uses a self-signed certificate for HTTPS on the EC2 public DNS.
- Browser warning ("Not secure") is expected with self-signed certs.
- For a trusted certificate (green lock), map a custom domain to this EC2 instance and issue a Let's Encrypt certificate with Certbot.

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
