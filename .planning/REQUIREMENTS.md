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
  - ⚠️ `statusService.js` exists but `trips.controller.js` (dispatch, complete, cancel) and `vehicles.controller.js` (status update) still bypass it and use direct Prisma calls.
- [x] **BACK-02**: Empty Express route/controller files for all 8 modules returning `{ mock: true }` were replaced with real Prisma-backed handlers.

### Frontend Scaffold & Navigation
- [x] **FRONT-01**: React routing for all 8 pages (auth, dashboard, vehicles, drivers, trips, maintenance, fuel, reports) with placeholder components.
- [x] **FRONT-02**: AuthContext providing user role/token state and ProtectedRoute wrapper.
- [x] **FRONT-03**: Shared layout with sidebar navigation.

### Frontend CRUD UX
- [ ] **CRUD-01**: Create/Edit/Delete modals or forms for Vehicles, Drivers, Trips, Maintenance.
- [ ] **CRUD-02**: Create/Edit forms for Fuel Logs and Expenses (currently stub buttons with no modals).

### Integration & Startup
- [ ] **INT-01**: Integration tests covering login flow, RBAC role guards, and dispatch→complete trip workflow.
- [ ] **INT-02**: Both dev servers (client :5173, server :7002) start cleanly with documented setup steps.


## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 1 | Complete |
| ENV-02 | Phase 1 | Complete |
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| BACK-01 | Phase 1 | ⚠️ Partial — statusService bypassed in trips/vehicles controllers |
| BACK-02 | Phase 1 | Complete |
| FRONT-01 | Phase 1 | Complete |
| FRONT-02 | Phase 1 | Complete |
| FRONT-03 | Phase 1 | Complete |
| DOCS-01 | Phase 1 | Complete |
| CRUD-01 | Phase 2 | Not Started |
| CRUD-02 | Phase 2 | Not Started |
| INT-01 | Phase 2 | Not Started |
| INT-02 | Phase 2 | Not Started |

**Coverage:**
- v1 requirements: 16 total (12 original + 4 new)
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-12*
*Last updated: 2026-07-12 — Audit: BACK-01 partial + CRUD/INT requirements added*
