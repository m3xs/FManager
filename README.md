# FManager

A personal finance tracker for managing your daily expenses. Add transactions with categories, attach PDF receipts, and get a clear monthly overview.

## Features

- Track expenses across 5 categories: Rent/Housing, Groceries/Food, Transport, Entertainment, Other
- Upload PDF receipts per transaction (up to 40 MB)
- Monthly spending overview with category breakdown and 6-month history
- Filter by category, date range, or search term
- View receipts inline without leaving the app
- Edit transactions and update or remove receipts in place
- Delete confirmation flow to prevent accidental data loss
- EN/DE language toggle (i18n via `react-i18next`)
- Password-based login with secure `httpOnly` cookie session (4h expiry)

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend  | Node.js + Express + TypeScript      |
| Database | SQLite (via `better-sqlite3`)       |
| Uploads  | Stored locally in `backend/uploads/` |
| Shared   | `@fmanager/common` — types, utils, category config |
| i18n     | `react-i18next` (EN / DE)           |
| Auth     | JWT + `httpOnly` cookie (`jsonwebtoken`, `cookie-parser`) |

## Getting Started

### Option A — Docker (recommended)

### 1. Configure environment

Create `backend/.env`:

```env
AUTH_PASSWORD=your_password
JWT_SECRET=a_long_random_secret
```

> `backend/.env` is git-ignored — never commit it.

### 2. Build and run

```bash
docker compose up --build
```

App will be available on **http://localhost**.

---

### Option B — Local dev

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `backend/.env` as above.

### 3. Start both servers

```bash
npm run dev
```

Frontend on **http://localhost:5173**, backend on **http://localhost:3001**.

## Authentication

All `/api/transactions` routes are protected. Login via `POST /api/auth/login` with `{ "password": "..." }`. On success, an `httpOnly` cookie is set and valid for 4 hours. The frontend checks auth on load and shows the login page if the session has expired.

## API Endpoints

### Auth

| Method | Path                | Description                  |
|--------|---------------------|------------------------------|
| POST   | `/api/auth/login`   | Login, sets `httpOnly` cookie |
| POST   | `/api/auth/logout`  | Logout, clears cookie        |

### Transactions (all require auth)

| Method | Path                              | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/transactions`               | List transactions (filterable)     |
| POST   | `/api/transactions`               | Create a transaction               |
| GET    | `/api/transactions/stats`         | Monthly, all-time & 6-month stats  |
| GET    | `/api/transactions/:id`           | Get single transaction             |
| PATCH  | `/api/transactions/:id`           | Update a transaction               |
| DELETE | `/api/transactions/:id`           | Delete a transaction               |
| GET    | `/api/transactions/:id/receipt`   | Stream the PDF receipt             |
| DELETE | `/api/transactions/:id/receipt`   | Remove just the receipt            |

## Project Structure

```
FManager/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts              # Express server (port 3001)
│   │   ├── db.ts                 # SQLite schema & connection
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT cookie verification
│   │   └── routes/
│   │       ├── auth.ts           # Login & logout
│   │       └── transactions.ts   # All transaction routes
│   ├── data/                     # SQLite database (auto-created)
│   └── uploads/                  # PDF receipts (auto-created)
├── common/                       # Shared types & utils (@fmanager/common)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                 # Serves SPA + proxies /api to backend
    └── src/
        ├── App.tsx               # Main layout, state & auth gate
        ├── api.ts                # Fetch helpers
        └── components/
            ├── LoginPage.tsx             # Password login screen
            ├── StatsBar.tsx              # Dashboard summary
            ├── FilterBar.tsx             # Category/date/search filters
            ├── TransactionList.tsx       # Grouped transaction list
            ├── AddTransactionModal.tsx   # Create transaction form
            └── TransactionDetailModal.tsx # Detail view + PDF viewer
```
