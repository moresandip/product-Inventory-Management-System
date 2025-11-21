# Product Inventory Management System - TODO List

## 1. Project Structure Setup
- [ ] Create `backend/` folder
- [ ] Create `frontend/` folder

## 2. Backend Setup
- [ ] Navigate to `backend/` and run `npm init -y`
- [ ] Install backend dependencies: express, sqlite3, cors, multer, csv-parser, express-validator, dotenv, nodemon
- [ ] Create `server.js` with Express app setup
- [ ] Create `db.js` for SQLite database initialization (products and inventory_logs tables)
- [ ] Create `routes/products.js` for API endpoints
- [ ] Implement GET /api/products (with optional pagination/sorting)
- [ ] Implement GET /api/products/search?name=query
- [ ] Implement PUT /api/products/:id (with validation and history tracking)
- [ ] Implement POST /api/products/import (CSV upload)
- [ ] Implement GET /api/products/export (CSV download)
- [ ] Implement GET /api/products/:id/history
- [ ] Add middleware for file uploads (multer)
- [ ] Add CORS and other middlewares

## 3. Frontend Setup
- [ ] Navigate to `frontend/` and run `npx create-react-app .`
- [ ] Install frontend dependencies: axios, react-router-dom
- [ ] Create main App.js with layout (header, table, sidebar)
- [ ] Create SearchBar component
- [ ] Create CategoryFilter component
- [ ] Create ProductTable component (with inline editing)
- [ ] Create ImportExport component
- [ ] Create HistorySidebar component
- [ ] Implement state management for products list, selected product, editing state
- [ ] Add API calls for all backend endpoints
- [ ] Handle file uploads for import
- [ ] Implement optimistic updates for editing
- [ ] Add loading states and error handling

## 4. Integration and Testing
- [ ] Ensure frontend API calls point to backend (localhost for dev)
- [ ] Test all CRUD operations
- [ ] Test CSV import/export end-to-end
- [ ] Test inline editing and history tracking
- [ ] Add responsive design (bonus)
- [ ] Add basic auth if time (bonus)

## 5. Deployment Preparation
- [ ] Initialize Git repository
- [ ] Create README.md with setup and deployment instructions
- [ ] Create .gitignore for both backend and frontend
- [ ] Update package.json scripts for build/start
- [ ] Prepare for backend deployment (e.g., Render)
- [ ] Prepare for frontend deployment (e.g., Netlify)
- [ ] Update API URLs in frontend for production

## 6. Deployment
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Netlify/Vercel
- [ ] Test live URLs
- [ ] Ensure CSV import/export works on live site
- [ ] Share GitHub repo link and deployed URLs
