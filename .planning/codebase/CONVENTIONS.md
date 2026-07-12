# Coding Conventions

**Analysis Date:** 2026-07-12

## Naming Patterns

**Files:**
- `PascalCase.jsx` for all frontend React component and page declarations (e.g., `App.jsx`, `ProtectedRoute.jsx`, `DashboardPage.jsx`).
- `camelCase.js` for all backend routes, controllers, services, and utility helpers (e.g., `statusService.js`, `auth.middleware.js`, `drivers.controller.js`).

**Functions:**
- `camelCase` for all standard functions and Express route actions (e.g., `setVehicleStatus`, `getAll`, `create`, `handlePrismaError`).
- React page and component declarations use `PascalCase` corresponding to their file name (e.g., `Layout`, `TripsPage`).

**Variables:**
- `camelCase` for standard variables (e.g., `parsedOdometer`, `driversWithExpiry`).
- `UPPER_SNAKE_CASE` for configuration constraints or static keys (e.g., `API_BASE`, `JWT_SECRET`).

**Types / DB Schemas:**
- `PascalCase` for Prisma database models (e.g., `User`, `VehicleStatus`, `TripStatus`).
- `UPPER_CASE` for database enum values (e.g., `Role.FLEET_MANAGER`, `VehicleStatus.AVAILABLE`).

---

## Code Style

**Formatting:**
- **Quotes**: Single quotes preferred for frontend imports/strings; double quotes or template strings on backend.
- **Semicolons**: Required and consistently used at the end of each statement.
- **Indentation**: 2-space indentation.
- **Line Length**: Kept under ~120 characters for readability.

**Linting:**
- Frontend runs ESLint using `.eslintrc` rules (kebab-case check, React warnings).
- Backend runs standard syntax rules without strict static linters.
- Execution command: `npm run lint` in `/client`.

---

## Import Organization

### Frontend Organization:
1. React core and libraries (`react`, `react-router-dom`).
2. Third-party UI utilities and libraries (`axios`, `recharts`, `lucide-react`).
3. Local React contexts (`AuthContext`).
4. API helper modules (`api/`).
5. Styles (`index.css`).

### Backend Organization:
1. Third-party runtime dependencies (`express`, `bcrypt`, `jsonwebtoken`, `@prisma/client`).
2. Local database singleton instances (`../lib/prisma`).
3. Local helper utilities, services, or middlewares.

---

## Error Handling

### Backend Patterns:
- Express route handlers are consistently wrapped in `try/catch` blocks.
- Caught errors are delegated to standard formatting handlers imported from `../utils/controllerHelpers`:
  - `handlePrismaError(res, error)` - catches database errors and maps DB status codes.
  - `sendValidationError(res, error)` - maps inputs validation errors.
- Database unique constraints return a `409 Conflict` (e.g., duplicate registration numbers or license numbers).

### Client Patterns:
- Asynchronous API calls inside event handlers (e.g. form submission, deletions) are wrapped in `try/catch`.
- Binds caught errors to local component state `error` to display inline banner warnings in the UI.

---

## Logging

- Standard `console.log` and `console.error` calls are used for logging Express server startup, DB connections, and unexpected error details.
- No structured JSON loggers (like Pino or Winston) are used.

---

## Comments

- Explain **why** a specific action is performed rather than **what** it does.
- Inline warning comments are used to demarcate bypassed service patterns or critical conditions.
- TODO comments format: `// TODO: description` (e.g., `// TODO: add forms for fuel logs`).

---

*Convention analysis: 2026-07-12*
*Update when coding standards change*
