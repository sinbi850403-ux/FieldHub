# Smart Workforce Platform — Runnable Template (v2 Regen)
Tech: **Expo (React Native) + NestJS + Prisma + PostgreSQL**

Includes:
- Auth/JWT + Roles
- Catalog (categories/jobs/input-fields)
- Customer bookings
- Provider: available/accept/status/evidence
- Admin: disputes resolve + settlements run (minimal)
- Swagger: http://localhost:3000/docs

## Prerequisites
- Node.js 18+
- Docker (with `docker compose`)

## Fresh-machine boot (no manual tweaks)
Run each command from the repository root (`/workspace/FieldHub`).

## 1) Start Postgres
```bash
docker compose up -d
```

## 2) Start API
```bash
cd apps/api && cp .env.example .env && npm i && npm run prisma:migrate && npm run prisma:seed && npm run start:dev
```

API: http://localhost:3000
Swagger: http://localhost:3000/docs

## 3) Start Mobile
Open a second terminal from the repository root and run:

```bash
cd apps/mobile && cp .env.example .env && npm i && cp .env.example .env && npm run start
```

`EXPO_PUBLIC_API_BASE` defaults to `http://localhost:3000` (set in `apps/mobile/.env`).

- Android emulator base URL: `http://10.0.2.2:3000`
- iOS simulator base URL: `http://localhost:3000`

## 4) Smoke flow (mobile + API)
1. Open the mobile app in Expo.
2. Signup with a new account.
3. Login with that account.
4. Verify API calls succeed:
   - `GET /health`
   - `GET /categories`

## Demo
- Open app → signup/login → browse categories → create booking.
- Provider/Admin can be tested via Swagger by creating accounts with role `PROVIDER` / `ADMIN`.
