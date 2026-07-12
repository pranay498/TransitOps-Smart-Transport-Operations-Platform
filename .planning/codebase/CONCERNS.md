# Codebase Concerns

**Analysis Date:** 2026-07-12

## Tech Debt

**Lack of Frontend CRUD for Fuel and Expenses:**
- **Issue**: Fuel and Expense logs have frontend listings, but the "+ Add Fuel Log" and "+ Add Expense" buttons are stubbed and do not trigger modal creation/editing forms.
- **Files**: `client/src/pages/FuelExpensesPage.jsx`
- **Why**: Staged for Hour 1-6 parallel module work, but frontend creation flow remains incomplete.
- **Impact**: Users cannot add fuel logs or expense logs from the UI.
- **Fix approach**: Implement React forms inside standard modals in `FuelExpensesPage.jsx` that post data to `/api/fuel-logs` and `/api/expenses`.

**Discrepancy in Port Documentation vs Configuration:**
- **Issue**: `README.md` documents backend server running on `5001` and frontend client on `3000`. However, the configuration sets the backend port to `7002` (via `/server/.env`) and fallback urls in the client code are configured for `7002`.
- **Files**: `README.md`, `server/.env`, `client/src/api/api.js`, `client/src/api/auth.js`
- **Why**: Hardcoded fallback values mismatching the initial scaffold documentation.
- **Impact**: Confuses developers attempting to launch the server based solely on the README commands.
- **Fix approach**: Update `README.md` quickstart documentation to explicitly reference port `7002` as the stable port mapping.

---

## Known Bugs

No active functional bugs were discovered in the existing implementation, but the lack of automated test boundaries makes regression bugs highly probable during subsequent phase updates.

---

## Security Considerations

**Hardcoded Weak JWT Secret in Dev Environments:**
- **Risk**: The development secret key `"supersecretkey123"` is weak and easily brute-forced.
- **Files**: `server/.env` (and fallback values in middleware code)
- **Current mitigation**: Configured inside a gitignored `.env` file for local development.
- **Recommendations**: Enforce strong, randomly generated keys for production systems and document environment checks.

---

## Performance Bottlenecks

**Serial KPI Calculation on Dashboard Mount:**
- **Problem**: The dashboard controller calculates multiple aggregated statistics (e.g. active maintenance counts, total fuel spent, total trips completed) through separate database hits.
- **File**: `server/src/controllers/dashboard.controller.js`
- **Measurement**: Unmeasured, but database reads scale linearly with database size.
- **Cause**: Lack of query caching or consolidated aggregation routines.
- **Improvement path**: Implement combined Prisma query projections or introduce simple Redis caching for dashboard routes if response times degrade.

---

## Fragile Areas

**Sequential Status Updates within Database Transactions:**
- **File**: `server/src/controllers/trips.controller.js`
- **Why fragile**: The `dispatch`, `complete`, and `cancel` handlers wrap vehicle/driver status mutations inside nested transaction promises.
- **Common failures**: If database deadlocks or timeouts occur, status flags can get out of sync or block connection threads.
- **Safe modification**: Ensure all operations inside `prisma.$transaction` are purely transactional, lightweight, and do not execute external async network requests.

---

## Test Coverage Gaps

**0% Coverage for Core State Transitions:**
- **What's not tested**: Critical state transition rules (e.g. ensuring a driver on a trip cannot be suspended, or a retired vehicle cannot go back in shop).
- **Risk**: Refactoring the controllers or Prisma schemas can break business-critical status constraints without detection.
- **Priority**: High
- **Difficulty to test**: Requires configuring a test database and importing Jest/Supertest or Vitest to mock HTTP routes.

---

*Concerns audit: 2026-07-12*
*Update as issues are fixed or new ones discovered*
