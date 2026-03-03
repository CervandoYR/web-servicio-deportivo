# Academia Deportiva — SaaS Platform

Multi-tenant SaaS platform for sports academies. Manage students, trainers, groups, attendance, payments, leads, email campaigns, and public landing pages — all from a single dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS + custom design system |
| State | Zustand (auth) + React Query (server state) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) + RBAC |
| Email | Nodemailer (SMTP) |

## Project Structure

```
web-servicio-deportivo/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Layout, UI components
│       ├── hooks/       # useAcademyTheme, etc.
│       ├── lib/         # Axios API client
│       ├── pages/       # All page components
│       └── store/       # Zustand auth store
├── server/              # Express backend
│   └── src/
│       ├── controllers/ # Route handlers
│       ├── middlewares/ # auth, RBAC, error handling
│       ├── routes/      # Express routers
│       └── services/    # Business logic
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── package.json         # Monorepo root (npm workspaces)
```

## Getting Started

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd web-servicio-deportivo
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database URL, JWT secrets, and SMTP settings
```

### 3. Set up the database

```bash
# Push the schema (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Start development servers

```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@demo.com | Admin123! |
| Academy Admin | manager@academia.com | Admin123! |
| Trainer | entrenador@academia.com | Admin123! |

## Features

- **Multi-tenancy** — each academy has isolated data via `academyId` FK
- **Students** — CRUD, search, detail view with groups/payments/attendance history
- **Trainers** — manage trainer profiles and sport specializations
- **Groups** — assign trainers, set capacity, track occupancy
- **Attendance** — mark attendance per group/date with PRESENT/ABSENT/LATE/EXCUSED
- **Payments** — auto-generate monthly invoices, mark as paid, detect overdue
- **Leads** — CRM pipeline for prospective students, convert to enrolled student
- **Campaigns** — send segmented email campaigns via SMTP
- **Landing Editor** — manage public-facing landing page blocks and contact info
- **Public Landing** — SEO-friendly public page with contact form (auto-creates leads)
- **Settings** — academy branding (name, logo, primary color), user password change
- **Dynamic Theming** — each academy's primary color applied globally via CSS variables

## API Endpoints

All API routes are prefixed with `/api`.

| Resource | Base Path |
|----------|-----------|
| Auth | `/api/auth` |
| Academy | `/api/academy` |
| Students | `/api/students` |
| Trainers | `/api/trainers` |
| Groups | `/api/groups` |
| Attendance | `/api/attendance` |
| Payments | `/api/payments` |
| Leads | `/api/leads` |
| Campaigns | `/api/campaigns` |
| Dashboard | `/api/dashboard` |
| Landing | `/api/landing` |

## Available Scripts

```bash
npm run dev          # Start both client and server in development
npm run dev:client   # Start only the frontend
npm run dev:server   # Start only the backend
npm run build        # Build the frontend for production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes (dev, no migration history)
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed the database with demo data
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `PORT` | Backend port (default: 4000) |
| `CLIENT_URL` | Frontend URL for CORS |
| `SMTP_*` | Email configuration for campaigns |
