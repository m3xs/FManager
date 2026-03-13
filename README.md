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

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend  | Node.js + Express + TypeScript      |
| Database | SQLite (via `better-sqlite3`)       |
| Uploads  | Stored locally in `backend/uploads/` |
| Shared   | `@fmanager/common` — types, utils, category config |
| i18n     | `react-i18next` (EN / DE)           |

## Getting Started

### 1. Install dependencies

```bash
# From the project root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start the backend

```bash
cd backend
npx tsx src/index.ts
```

Runs on **http://localhost:3001**

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npx vite
```

Runs on **http://localhost:5173** — open this in your browser.

## API Endpoints

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
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server (port 3001)
│   │   ├── db.ts                 # SQLite schema & connection
│   │   └── routes/
│   │       └── transactions.ts   # All API routes
│   ├── data/                     # SQLite database (auto-created)
│   └── uploads/                  # PDF receipts (auto-created)
└── frontend/
    └── src/
        ├── App.tsx               # Main layout & state
        ├── api.ts                # Fetch helpers
        ├── types.ts              # TypeScript types
        ├── utils.ts              # Formatting & category config
        └── components/
            ├── StatsBar.tsx              # Dashboard summary
            ├── FilterBar.tsx             # Category/date/search filters
            ├── TransactionList.tsx       # Grouped transaction list
            ├── AddTransactionModal.tsx   # Create transaction form
            └── TransactionDetailModal.tsx # Detail view + PDF viewer
```
