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
- Docker

## 1) Start Postgres
```bash
docker compose up -d
```

## 2) Start API
```bash
cd apps/api
cp .env.example .env
npm i
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```
API: http://localhost:3000
Swagger: http://localhost:3000/docs

## 3) Start Mobile
```bash
cd apps/mobile
npm i
cp .env.example .env
npm run start
```
Android emulator base URL: http://10.0.2.2:3000
iOS simulator: http://localhost:3000

## Demo
- Open app → signup/login → browse categories → create booking.
- Provider/Admin can be tested via Swagger by creating accounts with role PROVIDER/ADMIN.
