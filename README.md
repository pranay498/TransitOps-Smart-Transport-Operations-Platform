# TransitOps — Fleet Management Platform

A monorepo fleet/trip management platform built with React + Vite (frontend) and Express + Prisma + PostgreSQL (backend).

---

## 📁 Structure

```
/
├── client/          # React 18 + Vite + Tailwind frontend
├── server/          # Express + Node + Prisma backend
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or connection to a Postgres instance)

---

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE transitops;
```

Copy the env example and update the connection string:

```bash
# In /server/.env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/transitops?schema=public"
JWT_SECRET="your-secret-key"
PORT=5001
```

---

### 2. Backend (Express + Prisma)

```bash
cd server
npm install

# Push schema to database
npx prisma db push

# Seed initial data
npm run seed

# Start dev server
npm run dev
```

Server runs at **http://localhost:5001**

---

### 3. Frontend (React + Vite)

```bash
cd client
npm install

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 🔑 Auth

`POST /api/auth/login` → returns `{ token, role }`

**Demo Accounts** (password: `password123`):

| Email | Role |
|-------|------|
| fleetmanager@transitops.com | FLEET_MANAGER |
| driver@transitops.com | DRIVER |
| safetyofficer@transitops.com | SAFETY_OFFICER |
| financialanalyst@transitops.com | FINANCIAL_ANALYST |

---

## 🔌 API Overview

All endpoints require `Authorization: Bearer <token>` header.

| Prefix | Module | Owner |
|--------|--------|-------|
| `/api/auth` | Authentication | — |
| `/api/dashboard` | KPIs | Person A |
| `/api/vehicles` | Vehicle CRUD | Person A |
| `/api/drivers` | Driver CRUD | Person A |
| `/api/trips` | Trip Lifecycle | Person B |
| `/api/maintenance` | Maintenance Logs | Person B |
| `/api/fuel-logs` | Fuel Tracking | Person C |
| `/api/expenses` | Expense Tracking | Person C |
| `/api/reports` | Analytics & CSV | Person C |

---

## 🏗️ Shared Contracts

### statusService.js

Located at `server/src/services/statusService.js`.  
**Do not write your own status mutation logic.** Always use:

```js
const { setVehicleStatus, setDriverStatus } = require('../services/statusService');

// Sets vehicle status with transition validation
await setVehicleStatus(vehicleId, 'ON_TRIP');

// Sets driver status with transition validation  
await setDriverStatus(driverId, 'ON_TRIP');
```

**Legal transitions:**
- `RETIRED` vehicles **cannot** transition back to any other status.
- All other transitions are allowed (validated at business logic layer).

---

## 🛡️ RBAC Roles

| Role | Can Write Vehicles/Drivers | Can Write Trips | Can View Reports |
|------|--------------------------|-----------------|-----------------|
| FLEET_MANAGER | ✅ | ✅ | ✅ |
| DRIVER | ❌ | ❌ | ❌ |
| SAFETY_OFFICER | ✅ (drivers only) | ❌ | ✅ |
| FINANCIAL_ANALYST | ❌ | ❌ | ✅ |

---

## 📦 Prisma Schema

Schema lives at `server/prisma/schema.prisma`. **Do not change field names** — all 3 modules depend on the same contract.

To regenerate Prisma Client after schema changes:

```bash
cd server
npx prisma generate
npx prisma db push
```
