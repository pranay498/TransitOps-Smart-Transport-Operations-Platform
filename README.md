# ⚡ TransitOps — Smart Fleet Management Platform

TransitOps is a full-stack fleet and transport operations management platform built for logistics companies to manage their vehicles, drivers, trips, maintenance, fuel, and expenses — all from a single dashboard.

---

## 🚀 What TransitOps Does

TransitOps gives fleet managers and operations teams complete visibility and control over their transport operations. From tracking where every vehicle is, to managing driver assignments, logging fuel, tracking maintenance, and generating financial reports — everything is handled in one place.

---

## ✨ Features

### 🔐 Role-Based Access Control
TransitOps supports four distinct user roles, each with specific permissions:

- **Fleet Manager** — Full access. Can manage vehicles, drivers, trips, maintenance, fuel, expenses, and view all reports.
- **Safety Officer** — Can manage drivers, log and close maintenance records, and view reports.
- **Driver** — Read-only access. Can view trips, vehicles, and other records.
- **Financial Analyst** — Can view reports and financial data.

Each user logs in with their role, and the interface automatically shows or hides features based on what they're allowed to do.

---

### 🚛 Vehicle Management
- Add vehicles to the fleet with details like registration number, name, type, maximum load capacity, current odometer reading, and acquisition cost.
- Filter vehicles by type (Mini Truck, Pickup, Heavy Truck, etc.) and status.
- Update vehicle details at any time.
- Track vehicle status in real time:
  - **Available** — Ready to be dispatched
  - **On Trip** — Currently on an active trip
  - **In Shop** — Under maintenance
  - **Retired** — Permanently decommissioned (cannot be re-activated)
- Vehicles with linked trips or logs are protected from accidental deletion — the system shows a clear error and suggests retiring the vehicle instead.

---

### 👤 Driver Management
- Register drivers with their license number, license category, license expiry date, contact number, and safety score.
- The system automatically flags drivers whose licenses have **expired** with a red "EXPIRED" badge.
- Filter drivers by status.
- Track driver status:
  - **Available** — Ready for assignment
  - **On Trip** — Currently driving
  - **Off Duty** — Not available
  - **Suspended** — Barred from trips
- Expired or suspended drivers are automatically blocked from being assigned to new trips.
- Drivers with linked trips are protected from accidental deletion.

---

### 🗺️ Trip Lifecycle Management
Trips follow a structured pipeline with enforced business rules at every stage:

1. **Draft** — Trip is created with source, destination, vehicle, driver, cargo weight, and planned distance. The system validates:
   - Cargo weight does not exceed the vehicle's maximum load capacity
   - Both the vehicle and driver are available (not on another trip or suspended)
   - The driver's license is not expired

2. **Dispatched** — Fleet Manager dispatches the trip. The system re-validates availability (guards against race conditions) and automatically marks both the vehicle and driver as "On Trip."

3. **Completed** — Fleet Manager marks the trip as complete by entering the final odometer reading and fuel consumed. The system:
   - Updates the vehicle's odometer
   - Creates a fuel log entry automatically
   - Releases the vehicle and driver back to "Available"

4. **Cancelled** — Either a Draft or Dispatched trip can be cancelled. Vehicle and driver statuses are reverted appropriately.

The Trips page shows pipeline tabs for each status (Draft, Dispatched, Completed, Cancelled) for easy tracking.

---

### 🔧 Maintenance Management
- Log maintenance work orders for any non-retired vehicle.
- When a maintenance log is created, the vehicle's status is automatically set to **In Shop**.
- Filter logs by active/closed status.
- Close a maintenance log when work is complete — the vehicle is automatically released back to **Available** (unless it is retired).
- Multiple active maintenance logs for the same vehicle are supported — the vehicle only returns to Available when all open logs are closed.
- Retired vehicles are blocked from new maintenance logging.

---

### ⛽ Fuel & Expense Tracking
- Log fuel fill-ups per vehicle with liters, cost, and date.
- Track operational expenses separately (tolls, repairs, miscellaneous).
- All fuel consumed during trip completion is automatically logged.
- View and filter fuel logs and expenses by vehicle.

---

### 📊 Reports & Analytics
The Reports section provides fleet-wide and per-vehicle analytics across four categories:

- **Fuel Efficiency** — Shows actual distance driven (based on odometer) and total fuel consumed per vehicle, with km/L efficiency calculated. Fleet-wide average is also displayed.

- **Fleet Utilization** — Shows how many vehicles are active, available, or in maintenance. Displays fleet utilization percentage, drivers on duty, and a bar chart of completed vs. dispatched trips per vehicle.

- **Operational Costs** — Breaks down total costs per vehicle into fuel, maintenance, and other expenses. Shows fleet-wide totals.

- **Return on Investment (ROI)** — Estimates revenue generated per vehicle based on distance driven (at a configurable rate per km), compares it against total costs, and calculates ROI percentage per vehicle.

All reports can be **exported as CSV** for use in Excel or other tools.

---

### 📟 Live Dashboard
The dashboard provides a real-time overview of the entire fleet:
- Active vehicles (On Trip)
- Available vehicles
- Vehicles in maintenance
- Active and pending trips
- Drivers on duty
- Fleet utilization percentage
- Live vehicle monitor table with current status of every vehicle

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (JSON Web Tokens) |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (running locally or via a hosted provider)

### 1. Database Setup

```bash
# Create a PostgreSQL database
CREATE DATABASE transitops;
```

Configure your environment in `server/.env`:

```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/transitops"
JWT_SECRET="your-secret-key"
PORT=7002
```

### 2. Backend

```bash
cd server
npm install
npx prisma db push      # Apply schema to database
node prisma/seed.js     # Create default user accounts
npm run dev             # Start server at http://localhost:7002
```

### 3. Frontend

```bash
cd client
npm install
npm run dev             # Start app at http://localhost:3000
```

---

## 🔑 Default Login Accounts

All accounts use the password: **`password123`**

| Email | Role |
|-------|------|
| fleetmanager@transitops.com | Fleet Manager |
| driver@transitops.com | Driver |
| safetyofficer@transitops.com | Safety Officer |
| financialanalyst@transitops.com | Financial Analyst |

---

## 📄 License

This project is for educational and internship purposes.
