# Architecture

**Analysis Date:** 2026-07-12

## Pattern Overview

**Overall:** Decoupled Client-Server Monorepo.
- **Frontend**: A client-side Single Page Application (SPA) built with React 18, utilizing Client-Side Routing and React Context for state synchronization.
- **Backend**: An Express.js REST API monolith interacting with PostgreSQL via the Prisma client.

**Key Characteristics:**
- **Monorepo Separation**: Client and server codebases reside in distinct folders (`/client` and `/server`) with separate dependency manifests (`package.json`).
- **Stateless REST Services**: Backend routing does not maintain in-memory user sessions; it relies on token verification per incoming HTTP request.
- **Shared Business Contract**: Vehicle and driver state transitions are strictly governed by a unified backend validator service.

---

## Layers

### 1. Presentation Layer (Frontend Client)
- **Purpose**: Displays the fleet administration interfaces, handles form inputs, and renders KPI dashboards.
- **Location**: `client/src/pages/` and `client/src/components/`.
- **Depends on**: Axios client services (`client/src/api/`).
- **Used by**: End-users of the system.

### 2. API Routing Layer
- **Purpose**: Defines system route mappings, endpoint paths, and registers route-specific security guards.
- **Location**: `server/src/routes/`.
- **Depends on**: Authentication and RBAC middlewares, and Controllers.
- **Used by**: Express router.

### 3. Middleware Layer
- **Purpose**: Inspects request contexts (e.g., parsing auth headers) and enforces access control rules before executing business logic.
- **Location**: `server/src/middleware/`.
- **Depends on**: Database models (if querying user metadata).
- **Used by**: Routing layer.

### 4. Controller Layer
- **Purpose**: Parses client query/params/body payloads, sanitizes formats, maps responses, and manages HTTP success/error return paths.
- **Location**: `server/src/controllers/`.
- **Depends on**: Services, Prisma DB layer, and helper utilities.
- **Used by**: API Routing layer.

### 5. Service Layer (Business Logic)
- **Purpose**: Implements core business assertions, state transition gates, and validations.
- **Location**: `server/src/services/`.
- **Depends on**: Prisma DB layer.
- **Used by**: Controller layer (specifically vehicles, drivers, and trips controllers).

### 6. Database Access Layer
- **Purpose**: Provides a database connection client singleton.
- **Location**: `server/src/lib/`.
- **Depends on**: Prisma Client code-generation.
- **Used by**: Service and Controller layers.

---

## Data Flow

### Request-Response Lifecycle Example (Dispatching a Trip)

1. **User Interaction**: User clicks "Dispatch" on `client/src/pages/TripsPage.jsx`.
2. **API Invocation**: Axios calls `POST http://localhost:7002/api/trips/:id/dispatch` with user's JWT in headers.
3. **Authentication**: `auth.middleware.js` verifies the JWT token signature and decodes the user's role.
4. **Authorization Guard**: `rbac.middleware.js` checks if the role (e.g., `FLEET_MANAGER`) has access to write trips.
5. **Route Mapping**: `trips.routes.js` redirects the request context to `trips.controller.js#dispatch`.
6. **Controller Validation**: Controller looks up the trip and checks if the assigned vehicle and driver statuses are currently `AVAILABLE`.
7. **Business Rules Execution**: The controller executes a transaction updating statuses:
   - Invokes `setVehicleStatus(vehicleId, 'ON_TRIP')` in `statusService.js`.
   - Invokes `setDriverStatus(driverId, 'ON_TRIP')` in `statusService.js`.
8. **Prisma Mutation**: `statusService.js` performs validation checks (e.g. checking that a retired vehicle is not used) and sends update commands via `prisma.js` client.
9. **Transaction Complete**: The trip status changes to `DISPATCHED` in the database.
10. **JSON Response**: Controller compiles the updated trip record and sends a `200 OK` JSON response back to the client.
11. **UI Refresh**: Client receives the data, updates local state, and prompts re-rendering.

### State Management:
- **Client**: JWT session and user roles are globally shared via `AuthContext.jsx`. Page data is requested from the backend on page mount.
- **Server**: Stateless. The PostgreSQL database is the single source of truth.

---

## Key Abstractions

### `statusService.js` (Shared State Mutator)
- **Purpose**: Prevents illegal vehicle/driver transitions. All status updates must pass through this service to ensure data consistency.
- **Implementation**: `server/src/services/statusService.js`.
- **Pattern**: Business rules helper functions.

### `AuthContext` (Client Auth Provider)
- **Purpose**: Tracks global session data, handling token storage, automatic logout redirection, and role validation.
- **Implementation**: `client/src/context/AuthContext.jsx`.
- **Pattern**: React Context Provider.

---

## Entry Points

### Client Entry Point
- **Location**: `client/src/main.jsx`
- **Responsibilities**: Bootstraps the React DOM tree and mounts it to `index.html`. Wraps the layout in `BrowserRouter` and `AuthProvider`.

### Server Entry Point
- **Location**: `server/src/index.js`
- **Responsibilities**: Registers core Express middlewares (CORS, JSON parsers), binds API routes, connects to PostgreSQL via Prisma, and starts listening on the designated network port.

---

## Error Handling

- **Server-Side Exception Handler**:
  - Controller actions are wrapped in `try/catch` blocks.
  - Unhandled errors are routed to helper handlers in `server/src/utils/controllerHelpers.js` (`handlePrismaError`, `sendValidationError`).
  - Returns appropriate status codes: `400` (Validation), `409` (Conflict/Unique Key Violation), `404` (Not Found), `500` (Internal Server Error).
- **Client-Side Catching**:
  - API calls are wrapped in `try/catch` in UI forms and action buttons.
  - Binds errors to component state variables (`error`, `submitError`) to render inline banners without crashing page threads.

---

## Cross-Cutting Concerns

- **Logging**: Standard console stdout logs on startup and routes.
- **Auth Guarding**: Token validation and RBAC checks run as serial Express middlewares on protected routes.
- **Data Validation**: Client inputs are parsed and converted to database-safe numbers or Date formats using helpers in `controllerHelpers.js`.

---

*Architecture analysis: 2026-07-12*
*Update when major patterns change*
