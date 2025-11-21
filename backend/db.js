const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'In Stock',
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    old_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    changed_by TEXT DEFAULT 'admin',
    change_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  console.log('Database initialized');
});

module.exports = db;
