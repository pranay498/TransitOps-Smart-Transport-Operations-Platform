# Requirements: TransitOps

**Defined:** 2026-07-12
**Core Value:** Enable three developers to work in parallel on separate modules with zero starting friction, minimal merge conflicts, and verified type-safety/authentication contracts.

## v1 Requirements

### Environment & Dependencies
- [x] **ENV-01**: Client package.json setup with dependencies (react-router-dom, axios, recharts, tailwindcss) and npm install executed.
- [x] **ENV-02**: Server package.json setup with dependencies (express, prisma, @prisma/client, jsonwebtoken, bcrypt, cors, dotenv) and npm install executed.

### Database & Seed
- [x] **DB-01**: Prisma Schema implemented exactly with User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, and Expense models.
- [x] **DB-02**: Database seed script `seed.js` creating one user per role (password "password123"), 3 vehicles (1 AVAILABLE, 1 ON_TRIP, 1 IN_SHOP), and 3 drivers (1 AVAILABLE, 1 ON_TRIP, 1 SUSPENDED).

### Authentication & Security
- [x] **AUTH-01**: Working JWT Authentication (`POST /api/auth/login`) returning `{ token, role }`.
- [x] **AUTH-02**: RBAC middleware (`rbac.middleware.js`) that takes allowed roles and returns a 403 response if the user's role is not authorized.

### Backend Scaffold & Services
- [ ] **BACK-01**: `statusService.js` with `setVehicleStatus()` and `setDriverStatus()` mutating functions as the only mutators allowed.
- [x] **BACK-02**: Empty Express route/controller files for all 8 modules returning `{ mock: true }` were replaced with real Prisma-backed handlers.

### Frontend Scaffold & Navigation
- [x] **FRONT-01**: React routing for all 8 pages (auth, dashboard, vehicles, drivers, trips, maintenance, fuel, reports) with placeholder components.
- [x] **FRONT-02**: AuthContext providing user role/token state and ProtectedRoute wrapper.
- [x] **FRONT-03**: Shared layout with sidebar navigation.

### Documentation
- [x] **DOCS-01**: Root README.md documenting how to run development servers and database setup.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 1 | Complete |
| ENV-02 | Phase 1 | Complete |
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| BACK-01 | Phase 1 | Partial |
| BACK-02 | Phase 1 | Complete |
| FRONT-01 | Phase 1 | Complete |
| FRONT-02 | Phase 1 | Complete |
| FRONT-03 | Phase 1 | Complete |
| DOCS-01 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-12*
*Last updated: 2026-07-12 after implementation update*
