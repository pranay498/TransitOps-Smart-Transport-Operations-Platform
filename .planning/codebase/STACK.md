# Technology Stack

**Analysis Date:** 2026-07-12

## Languages

**Primary:**
- JavaScript (ES6+) - Used for all application code in both client and server:
  - React (JSX/ESM) for frontend development.
  - CommonJS modules on the Node.js backend.

**Secondary:**
- HTML5 - Shell structure in `client/index.html`.
- CSS3 - Global styling in `client/src/index.css` via Tailwind CSS directives.

## Runtime

**Environment:**
- Node.js (Version 18.x or newer required) - Executes the backend server.
- Browser Runtime - Executes the client React bundle (tested with modern evergreen browsers).

**Package Manager:**
- npm (Node Package Manager) - Version matching Node.js 18+.
- Lockfile: `package-lock.json` present in both `client/` and `server/` directories.

## Frameworks

**Core:**
- React 18.2.0 - Client UI framework.
- Express 4.19.2 - Server HTTP routing and middleware framework.
- Prisma ORM 5.12.1 - Database connection, schema generation, and query building.

**Testing:**
- None - No automated test runner configured in `package.json` for either client or server.

**Build/Dev:**
- Vite 5.1.6 - Client bundler and development server.
- Tailwind CSS 3.4.1 - Utility-first styling framework.
- Autoprefixer 10.4.19 & PostCSS 8.4.38 - CSS post-processing.
- nodemon 3.1.0 - Auto-restarts server on file changes.

## Key Dependencies

**Critical:**
- `@prisma/client` 5.12.1 - Database query interface.
- `jsonwebtoken` 9.0.2 - Generates and verifies user authorization tokens.
- `bcrypt` 5.1.1 - Secure password hashing.
- `axios` 1.6.8 - Frontend HTTP requests to backend.
- `react-router-dom` 6.22.3 - Client-side routing.
- `recharts` 2.12.3 - Dashboard visualizations and analytics rendering.
- `lucide-react` 0.363.0 - Vector icon suite for the frontend layout.

**Infrastructure:**
- `cors` 2.8.5 - Express CORS handling middleware.
- `dotenv` 16.4.5 - Loads environment variables from `.env` on backend startup.

## Configuration

**Environment:**
- Backend configuration: `/server/.env` defining:
  - `DATABASE_URL` - Connection string for PostgreSQL database.
  - `JWT_SECRET` - Key used to sign authorization tokens.
  - `PORT` - Port to start Express on (defaults to 7002/5001).

**Build:**
- `/client/vite.config.js` - Vite compiler/dev configurations.
- `/client/tailwind.config.js` - Tailwind design tokens and purge paths.
- `/client/postcss.config.js` - PostCSS runner registration.

## Platform Requirements

**Development:**
- Cross-platform (Windows, macOS, Linux).
- PostgreSQL database engine (local or remote).
- Node.js runtime installed locally.

**Production:**
- Backend: Node.js server environment (PM2, Docker, AWS ECS, or similar).
- Database: Managed PostgreSQL instance.
- Frontend: Static file hosting (Vercel, Netlify, AWS S3, or similar).

---

*Stack analysis: 2026-07-12*
*Update after major dependency changes*
