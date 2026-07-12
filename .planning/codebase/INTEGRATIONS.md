# External Integrations

**Analysis Date:** 2026-07-12

## APIs & External Services

No third-party SaaS APIs (such as payment gateways, SMS services, or email providers) are integrated into this codebase. All operations are handled internally within the application.

## Data Storage

**Databases:**
- **PostgreSQL** - Primary application data storage.
  - **Connection**: Managed via `DATABASE_URL` environment variable inside `server/.env`.
  - **Client**: `Prisma Client` (generated from `server/prisma/schema.prisma`).
  - **Migrations**: Executed via standard Prisma commands: `npx prisma db push` or `npx prisma migrate dev`.
  - **Models**:
    - `User` - User credentials, roles.
    - `Vehicle` - Fleet vehicles, configurations, odometer readings, status.
    - `Driver` - Names, license numbers/expiries, safety scores, status.
    - `Trip` - Sources, destinations, cargo weights, statuses, relations.
    - `MaintenanceLog` - Scheduled and unscheduled shop logs.
    - `FuelLog` - Liters and costs per vehicle.
    - `Expense` - General expenses categorized per vehicle.

**File Storage:**
- None. There are no features for uploading files (such as receipt images or driver avatars).

**Caching:**
- None. Database queries run directly against the PostgreSQL database.

## Authentication & Identity

**Auth Provider:**
- **Custom JWT (JSON Web Tokens)** - Self-contained authorization provider.
  - **Implementation**:
    - `server/src/controllers/auth.controller.js` validates credentials against hashed passwords in the DB using `bcrypt`.
    - Returns a signed JWT token and the user's role on successful login.
    - `server/src/middleware/auth.middleware.js` extracts the Bearer token from the incoming HTTP `Authorization` headers and verifies it using `jsonwebtoken` and the `JWT_SECRET`.
  - **Role-Based Access Control (RBAC)**:
    - Custom role-based guarding middleware in `server/src/middleware/rbac.middleware.js` verifies permissions against the decoded JWT payload.
    - Authorized roles are defined in the database schema: `FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`.
  - **Token Storage**: Saved client-side in the React application's state/context (`client/src/context/AuthContext.jsx`) and browser's `localStorage` for session persistence.

## Monitoring & Observability

- No external APM (Application Performance Monitoring) or error tracking services (like Sentry, Datadog, or LogRocket) are configured.
- **Logs**: Output directly to standard stdout/stderr streams (using standard `console.log` and `console.error`).

## CI/CD & Deployment

- No continuous integration pipelines (GitHub Actions, GitLab CI) or automated deployment flows are defined. All dev work is executed locally.

## Environment Configuration

**Development:**
- **Required Env Variables (in `server/.env`)**:
  - `DATABASE_URL` - PostgreSQL database connection URL (e.g. `postgresql://user:pass@localhost:5432/transitops`).
  - `JWT_SECRET` - Salt key for signing JWT authorization payloads.
  - `PORT` - Port where the server runs (configured in `server/src/index.js` or via `.env`).
- **Secrets Location**: Configured in `.env` (gitignored in `/server/.gitignore` to prevent leaking private credentials).

---

*Integration audit: 2026-07-12*
*Update when adding/removing external services*
