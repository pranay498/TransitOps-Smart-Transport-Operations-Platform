# TransitOps

## What This Is

TransitOps is a monorepo-based fleet and trip management platform with a React frontend and Express/Node backend, communicating via REST APIs and persisted with PostgreSQL via Prisma.

## Core Value

Enable three developers to work in parallel on separate modules with zero starting friction, minimal merge conflicts, and verified type-safety/authentication contracts.

## Requirements

### Validated

- Client package.json setup and dependencies are installed
- Server package.json setup and dependencies are installed
- Prisma schema and seed script are implemented with demo users, vehicles, and drivers
- JWT authentication and RBAC middleware are implemented
- React routing, AuthContext, ProtectedRoute, and sidebar layout are implemented
- Root README includes setup instructions and database connection details

### Active

- [ ] `statusService.js` should remain the shared business-rule contract for vehicle and driver status mutations and be consistently used by all status-changing controllers
- [ ] Domain create/edit/delete UX can be expanded beyond the current read-focused pages
- [ ] Verify the current dev startup path after the recent config edits, then document the exact commands and ports that are stable

### Out of Scope

- Detailed business logic for non-auth modules — left to individual developers during the hackathon
- Production deployment configurations or CI/CD pipelines
- Advanced real-time vehicle tracking or notifications (mocked or out of scope for hackathon v1)

## Context

- Originally staged for an 8-hour hackathon setup, but the repo now contains a functioning full-stack implementation
- Focus has shifted from scaffold completion to business-rule consistency and UI workflow completeness

## Constraints

- **Stack**: React 18, Vite, Tailwind CSS, Express, Node.js, PostgreSQL, Prisma, JWT
- **Role Mutability**: `statusService.js` contains the only allowed functions to mutate vehicle/driver status

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo layout | Keep client and server in one repo under `/client` and `/server` | Verified |
| Prisma Schema constraint | Hard contract that all 3 devs build against | Verified |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-12 after implementation update*
