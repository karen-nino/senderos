# Senderos de Chiapas

Monorepo for the **Senderos de Chiapas** project: a Next.js frontend and a Strapi headless CMS backend.

## Quick start

From the repo root (after [setting env vars](#2-environment-variables)):

```bash
# One-time: install root + frontend + backend dependencies
npm install && npm run install:all

# Run backend + frontend together (one terminal)
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Strapi admin:** [http://localhost:1337/admin](http://localhost:1337/admin)

Or run them separately: `npm run dev:backend` and `npm run dev:frontend` in two terminals.

---

## Repository structure

| Package | Path | Description |
|--------|------|-------------|
| **Frontend** | `senderos-de-chiapas/` | Next.js 14 (App Router), React 18, Bootstrap 5 |
| **Backend** | `backend/` | Strapi 5 (headless CMS, SQLite by default) |

## Prerequisites

- **Node.js** ≥ 20.0.0 (≤ 24.x.x recommended for Strapi)
- **npm** ≥ 6.0.0 (or Yarn/pnpm)

## Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd senderos

# Install frontend dependencies
cd senderos-de-chiapas && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment variables

Create the required `.env` files in each package (see [Environment variables](#environment-variables) below). You can copy from the examples:

```bash
cp senderos-de-chiapas/.env.example senderos-de-chiapas/.env.local
cp backend/.env.example backend/.env
```

Then edit each file and set the real values (especially Strapi secrets and `RESEND_API_KEY` if you use the contact form).

---

## Environment variables

### Frontend (`senderos-de-chiapas/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_STRAPI_URL` | No | Strapi API base URL (default: `http://localhost:1337`) |
| `STRAPI_URL` | No | Same as above, used server-side |
| `STRAPI_TOKEN` | No | Strapi API token for authenticated requests |
| `RESEND_API_KEY` | Yes (for contact) | [Resend](https://resend.com) API key for the contact form |

- Use `.env.local` for local development (not committed).
- For production, set these in your hosting provider (Vercel, etc.).

### Backend (`backend/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `HOST` | No | Host to bind (default: `0.0.0.0`) |
| `PORT` | No | Port (default: `1337`) |
| `APP_KEYS` | Yes | Comma-separated app keys (e.g. `key1,key2`) |
| `API_TOKEN_SALT` | Yes | Salt for API tokens |
| `ADMIN_JWT_SECRET` | Yes | JWT secret for admin panel |
| `TRANSFER_TOKEN_SALT` | Yes | Salt for transfer tokens |
| `JWT_SECRET` | Yes | JWT secret for API auth |
| `ENCRYPTION_KEY` | Yes | Encryption key |

Generate secure values for all “secret” and “salt” variables. Do not commit `.env`; use `.env.example` only as a template.

---

## Development

Run both apps (use two terminals).

**Terminal 1 – Strapi (backend):**

```bash
cd backend
npm run dev
```

- Admin: [http://localhost:1337/admin](http://localhost:1337/admin)  
- API: [http://localhost:1337/api](http://localhost:1337/api)

**Terminal 2 – Next.js (frontend):**

```bash
cd senderos-de-chiapas
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)

Ensure `NEXT_PUBLIC_STRAPI_URL` (or `STRAPI_URL`) in the frontend points to `http://localhost:1337` when developing locally.

---

## Production build

### Backend (Strapi)

```bash
cd backend
npm run build
npm start
```

- Set `NODE_ENV=production` in the environment.
- Configure your production database (e.g. PostgreSQL) via Strapi config and env vars if not using SQLite.
- Use a process manager (e.g. PM2) or your host’s start command in production.

### Frontend (Next.js)

```bash
cd senderos-de-chiapas
npm run build
npm start
```

- Set `NODE_ENV=production`.
- Set `NEXT_PUBLIC_STRAPI_URL` (and optionally `STRAPI_TOKEN`) to your production Strapi URL and token.
- Default port is 3000; override with `PORT` if needed.

### Deploy order

1. Deploy and run the **backend** first so the API is available.
2. Deploy the **frontend**, with env vars pointing to the production Strapi URL.

---

## Scripts reference

### From repo root

| Command | Description |
|---------|-------------|
| `npm install` | Install root devDependencies (e.g. concurrently) |
| `npm run install:all` | Install dependencies in frontend + backend |
| `npm run dev` | Run backend and frontend together (one terminal) |
| `npm run dev:backend` | Run only Strapi |
| `npm run dev:frontend` | Run only Next.js |
| `npm run build` | Build backend, then frontend (production) |
| `npm run build:backend` | Build only Strapi |
| `npm run build:frontend` | Build only Next.js |

### Per project

| Project | Command | Description |
|---------|---------|-------------|
| Frontend | `npm run dev` | Next.js dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm start` | Run production build |
| Frontend | `npm run lint` | Run ESLint |
| Backend | `npm run dev` | Strapi develop mode |
| Backend | `npm run build` | Strapi production build |
| Backend | `npm start` | Strapi production start |

---

## License

Private project. All rights reserved.
