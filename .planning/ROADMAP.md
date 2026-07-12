# Roadmap: TransitOps

## Overview

This plan tracks the actual 8-hour hackathon split for TransitOps. Hour 0-1 is a shared scaffold and schema lock, Hours 1-6 are parallel module work, Hours 6-7 are integration, and Hours 7-8 are bug bash plus the end-to-end demo workflow.

## Timeline

### Hr 0-1: Shared Scaffold
- Agree on the schema contract and repo structure.
- Scaffold the monorepo and lock the Prisma schema.
- Wire mock API endpoints so the frontend can build against stable routes.

### Hr 1-6: Parallel Module Work
- Person A: Auth, vehicles, drivers, dashboard KPIs.
- Person B: Trips and maintenance workflow.
- Person C: Fuel, expenses, reports, and dashboard polish.

### Hr 6-7: Integration
- Wire real APIs into the frontend.
- Replace remaining mocks.
- Verify RBAC and the shared status mutation contract.

### Hr 7-8: Bug Bash
- Seed demo data.
- Rehearse the example workflow end-to-end.
- Fix blocking bugs and cleanup issues.

## Team Split

### Scaffold Prompt
- Shared repo scaffold with client/server structure.
- Prisma schema locked in Hour 1.
- `statusService.js` defined as the single mutator contract for vehicle and driver status.

### Person A
- Vehicle CRUD.
- Driver CRUD.
- `statusService.js` completion.
- Dashboard KPIs.
- Vehicles, drivers, and dashboard frontend pages.

### Person B
- Trip lifecycle.
- Maintenance workflow.
- Trips and maintenance frontend pages.

### Person C
- Fuel and expense tracking.
- Reports and CSV export.
- Dashboard polish and charts if time allows.

## Integration Checkpoints

1. Hour 1: confirm the ROI/revenue decision for reports before dependent work continues.
2. Hour 3: Person A status service and dispatch-ready filters must be live.
3. Hour 6: run the example workflow end-to-end in one browser session.

## What Is Done

- Monorepo client/server structure is in place.
- Prisma schema, seed data, auth, and RBAC are implemented.
- Real backend handlers replaced the mock-only routes.
- Frontend routing, auth context, and layout are in place.
- Planning docs were updated to reflect the implemented state.

## What Ends Next

- Finish aligning all status-changing controllers to `statusService.js`.
- Build the remaining create/edit/delete forms.
- Add integration checks for login, RBAC, dispatch, and completion flows.
- Normalize startup/configuration so both dev servers run without manual cleanup.

## Current Status

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shared Scaffold | 1/1 | Complete | 2026-07-12 |
