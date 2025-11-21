# Product Inventory Management System

A full-stack inventory management platform built with **Node.js**, **Express**, **SQLite**, and **React**. It supports product CRUD operations, inline editing, CSV import/export, and an inventory history timeline to trace stock adjustments.

## Project Structure

```
.
├── backend   # Express + SQLite API
├── frontend  # React application
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+

## Backend Setup

```bash
cd backend
npm install
npm run dev       # starts nodemon on http://localhost:5000
```

Environment variables (optional) can live in `backend/.env`:

```
PORT=5000
DATABASE_PATH=./inventory.db
```

## Frontend Setup

```bash
cd frontend
npm install
npm start        # runs CRA dev server on http://localhost:3000
```

By default the React app proxies `/api` requests to `http://localhost:5000`. For production builds, configure the backend URL via `REACT_APP_API_BASE_URL`.

## Key Features

- **Products API** (`backend/routes/products.js`)
  - List, search, paginate, and filter products.
  - Create, update (with validation and unique-name enforcement), and delete products.
  - CSV import/export plus duplicate detection.
  - Inventory history tracking stored in `inventory_history`.
- **React UI** (`frontend/src/App.js`)
  - Search bar, category filter, and responsive toolbar (import/export, add product modal).
  - Inline editing with optimistic updates and status indicators.
  - Inventory history sidebar with change audit trail.

## Running Tests

Frontend tests (Jest + React Testing Library):

```bash
cd frontend
npm test -- --watchAll=false
```

Backend tests are not yet implemented; Supertest coverage can be added under `backend/tests`.

## Deployment Notes

- **Backend**: Deploy to Render/Railway/Fly. Ensure the SQLite file is persisted or switch to a managed database. Set `PORT` and any auth secrets via environment variables.
- **Frontend**: Deploy the CRA build folder to Netlify/Vercel. Configure `REACT_APP_API_BASE_URL` to point at the live backend before building.

After deployment, update this README with the GitHub repository URL plus the live frontend and backend links.

