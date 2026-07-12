# Testing Patterns

**Analysis Date:** 2026-07-12

## Test Framework

There is currently **no automated test framework** (such as Jest, Vitest, Cypress, or Playwright) configured in either the client or server applications.

**Run Commands:**
- No test runners are defined under scripts in `package.json` files.

---

## Test File Organization

No test files (`*.test.js`, `*.spec.js`) exist in the workspace. The directory layout is focused solely on source implementation.

---

## Fixtures and Seed Data

**Location:**
- `/server/prisma/seed.js`

**Test/Demo Accounts (password: `password123`):**
- `fleetmanager@transitops.com` (Role: `FLEET_MANAGER`)
- `driver@transitops.com` (Role: `DRIVER`)
- `safetyofficer@transitops.com` (Role: `SAFETY_OFFICER`)
- `financialanalyst@transitops.com` (Role: `FINANCIAL_ANALYST`)

**Initial Seed Setup:**
- 3 Vehicles seeded:
  - 1 `AVAILABLE` (reg number `reg-001`)
  - 1 `ON_TRIP` (reg number `reg-002`)
  - 1 `IN_SHOP` (reg number `reg-003`)
- 3 Drivers seeded:
  - 1 `AVAILABLE` (license expiry: 2027)
  - 1 `ON_TRIP` (license expiry: 2027)
  - 1 `SUSPENDED` (license expiry: 2027)

To reset the database and re-seed:
```bash
cd server
npx prisma db push --force-reset
npm run seed
```

---

## Manual Verification Workflows

Since automated tests are not present, verification is performed manually by completing the following sequence of steps:

### 1. User Authentication and RBAC Verification
- Navigate to the login page (`http://localhost:3000/` or standard port).
- Attempt login with invalid credentials → verify 400/401 error message.
- Log in with `fleetmanager@transitops.com` → verify redirection to Dashboard and presence of all sidebar navigation links.
- Log out, then log in with `driver@transitops.com` → verify restrictions (e.g. attempting to edit/create vehicles returns 403 Forbidden).

### 2. End-to-End Trip Lifecycle Verification
- **Create Trip (Draft)**:
  - Access Trips page.
  - Create a new trip by selecting an `AVAILABLE` vehicle (e.g., `reg-001`) and an `AVAILABLE` driver.
  - Verify that the trip is saved with `DRAFT` status.
- **Dispatch Trip**:
  - Click "Dispatch" on the newly created draft trip.
  - Verify:
    - Trip status updates to `DISPATCHED`.
    - Vehicle status updates to `ON_TRIP`.
    - Driver status updates to `ON_TRIP`.
- **Complete Trip**:
  - Click "Complete" on the dispatched trip.
  - Enter final odometer (must be greater than or equal to current vehicle odometer) and fuel consumed.
  - Submit completion.
  - Verify:
    - Trip status updates to `COMPLETED`.
    - Vehicle status updates back to `AVAILABLE`.
    - Driver status updates back to `AVAILABLE`.
    - Vehicle odometer increases to the final odometer value.
    - A new fuel log entry is created.

### 3. Business Rule / Boundary Constraint Verification
- Attempt to assign a `SUSPENDED` driver to a new trip → verify validation error on submit.
- Attempt to assign an expired driver license to a new trip → verify validation error on submit.
- Attempt to assign an `ON_TRIP` vehicle to a new trip → verify validation error.
- Attempt to update a vehicle status from `RETIRED` to `AVAILABLE` → verify the request is blocked by the statusService transition check with a clear error message.

---

*Testing analysis: 2026-07-12*
*Update when automated testing frameworks are integrated*
