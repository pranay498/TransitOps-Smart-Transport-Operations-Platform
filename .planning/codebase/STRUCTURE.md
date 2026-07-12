# Codebase Structure

**Analysis Date:** 2026-07-12

## Directory Layout

```
TransitOps/
├── .agents/                   # GSD planning scripts, skills, and settings (gitignored)
├── .planning/                 # Project roadmaps, states, requirements, and codebase maps
│   └── codebase/              # Codebase analysis documents
├── client/                    # React frontend application root
│   ├── src/                   # React source files
│   │   ├── api/               # API query services (Axios modules)
│   │   ├── components/        # Layout and Guard components
│   │   ├── context/           # React contexts (AuthContext)
│   │   └── pages/             # Frontend page views
│   └── package.json           # Frontend dependency manifest
├── server/                    # Express backend service root
│   ├── prisma/                # Prisma schema definition and seed scripts
│   ├── src/                   # Server source files
│   │   ├── controllers/       # Route request controller logic
│   │   ├── lib/               # Shared libraries (Prisma client singleton)
│   │   ├── middleware/        # Express middleware (Auth/RBAC guards)
│   │   ├── routes/            # Route bindings and endpoints
│   │   ├── services/          # Business logic helpers (statusService.js)
│   │   └── utils/             # Express helper utilities
│   └── package.json           # Backend dependency manifest
└── README.md                  # Development environment startup instructions
```

---

## Directory Purposes

**client/src/api/**
- Purpose: Groups all Axios HTTP requests into clean, module-specific JS files.
- Contains: `api.js` (axios interceptor setup), `auth.js`, `drivers.js`, `vehicles.js`, `trips.js`, `maintenance.js`, `fuel.js`, `expenses.js`, `reports.js`.

**client/src/components/**
- Purpose: Contains reusable layout frames and route wrappers.
- Contains: `Layout.jsx` (sidebar skeleton, routing links), `ProtectedRoute.jsx` (auth/role wrapper checking JWT state).

**client/src/context/**
- Purpose: React contexts for global state management.
- Contains: `AuthContext.jsx` (contains login, logout, and token check states).

**client/src/pages/**
- Purpose: The views representing individual page routes.
- Contains: `DashboardPage.jsx`, `VehiclesPage.jsx`, `DriversPage.jsx`, `TripsPage.jsx`, `MaintenancePage.jsx`, `FuelExpensesPage.jsx`, `ReportsPage.jsx`, `LoginPage.jsx`.

**server/prisma/**
- Purpose: Handles SQL schema modeling and database seeding.
- Key files: `schema.prisma` (PostgreSQL schemas, models, enums), `seed.js` (populates database with demo users, vehicles, drivers).

**server/src/controllers/**
- Purpose: Contains request controllers that fetch or manipulate model data.
- Contains: `auth.controller.js`, `dashboard.controller.js`, `vehicles.controller.js`, `drivers.controller.js`, `trips.controller.js`, `maintenance.controller.js`, `fuel.controller.js`, `expenses.controller.js`, `reports.controller.js`.

**server/src/routes/**
- Purpose: Defines Express endpoints and registers middleware chains.
- Contains: One router file for each controller, bound collectively in `server/src/index.js`.

---

## Key File Locations

**Entry Points:**
- `client/src/main.jsx` - Bootstraps the React DOM client application.
- `server/src/index.js` - Boots Express and connects database/ports.

**Configuration:**
- `client/vite.config.js` - Configuration for compiling React and managing development proxies.
- `client/tailwind.config.js` - Configuration for Tailwind design tokens.
- `server/.env` - Stored backend configuration parameters (secrets, ports, URLs).

**Core Logic:**
- `server/src/services/statusService.js` - Status rules and mutations.
- `server/src/utils/controllerHelpers.js` - General backend helpers.

---

## Naming Conventions

**Files:**
- `PascalCase.jsx` - Used for React page and component declarations (e.g. `DashboardPage.jsx`, `Layout.jsx`).
- `camelCase.js` - Used for utilities, routes, API clients, and services (e.g. `statusService.js`, `auth.routes.js`).

**Directories:**
- `camelCase` / `kebab-case` - Used for all project subdirectories (e.g., `controllers/`, `gsd-core/`).

---

## Where to Add New Code

**New API Endpoint:**
1. Define route path in `server/src/routes/[module].routes.js`.
2. Implement route logic in `server/src/controllers/[module].controller.js`.
3. Add backend verification helper in `server/src/utils/` if needed.
4. Bind Axios wrapper in `client/src/api/[module].js`.

**New UI Screen:**
1. Create page component: `client/src/pages/[PageName]Page.jsx`.
2. Register route in `/client/src/App.jsx`.
3. Link page component in `client/src/components/Layout.jsx`.

**New Database Model:**
1. Add model schema to `server/prisma/schema.prisma`.
2. Push to local postgres instance: `npx prisma db push`.
3. Rebuild Prisma client: `npx prisma generate`.
4. Update `server/prisma/seed.js` to create dummy records if needed.

---

*Structure analysis: 2026-07-12*
*Update when directory structure changes*
