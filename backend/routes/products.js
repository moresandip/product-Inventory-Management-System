const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const fsPromises = fs.promises;
const SORTABLE_FIELDS = ['name', 'category', 'brand', 'stock', 'status', 'unit', 'id'];

const runGet = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const runAll = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const runExecute = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function runCallback(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'name',
      order = 'asc',
      category,
    } = req.query;

    const normalizedSort = SORTABLE_FIELDS.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const numericLimit = limit === 'all' ? null : Math.max(parseInt(limit, 10) || 10, 1);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = numericLimit ? (numericPage - 1) * numericLimit : 0;

    let query = 'SELECT * FROM products';
    const params = [];

    if (category) {
      query += ' WHERE LOWER(category) = LOWER(?)';
      params.push(category);
    }

    query += ` ORDER BY ${normalizedSort} ${sortOrder}`;
    if (numericLimit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(numericLimit, offset);
    }

    const rows = await runAll(query, params);

    if (!numericLimit) {
      return res.json({ products: rows, pagination: null });
    }

    let countQuery = 'SELECT COUNT(*) as total FROM products';
    const countParams = [];
    if (category) {
      countQuery += ' WHERE LOWER(category) = LOWER(?)';
      countParams.push(category);
    }

    const countResult = await runGet(countQuery, countParams);

    return res.json({
      products: rows,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / numericLimit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  try {
    const rows = await runAll(
      'SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) ORDER BY name',
      [`%${name}%`]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const rows = await runAll(
      `SELECT DISTINCT category
       FROM products
       WHERE category IS NOT NULL AND TRIM(category) != ''
       ORDER BY category`
    );
    return res.json(rows.map((row) => row.category));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('unit').optional().isString(),
    body('category').optional().isString(),
    body('brand').optional().isString(),
    body('status').optional().isString(),
    body('image').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, unit, category, brand, stock = 0, status = 'In Stock', image } = req.body;
    const trimmedName = name.trim();

    try {
      const existing = await runGet(
        'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
        [trimmedName]
      );
      if (existing) {
        return res.status(400).json({ error: 'Product name must be unique' });
      }

      const stockValue = Number.parseInt(stock, 10) || 0;
      const result = await runExecute(
        `INSERT INTO products (name, unit, category, brand, stock, status, image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [trimmedName, unit, category, brand, stockValue, status, image]
      );

      const newProduct = await runGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
      return res.status(201).json(newProduct);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  '/:id',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('unit').optional(),
    body('category').optional(),
    body('brand').optional(),
    body('status').optional(),
    body('image').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, unit, category, brand, stock, status, image } = req.body;
    const trimmedName = name.trim();
    const stockValue = Number.parseInt(stock, 10);

    try {
      const existing = await runGet(
        'SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND id != ?',
        [trimmedName, id]
      );
      if (existing) {
        return res.status(400).json({ error: 'Product name must be unique' });
      }

      const currentProduct = await runGet('SELECT * FROM products WHERE id = ?', [id]);
      if (!currentProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await runExecute(
        `UPDATE products
         SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ?
         WHERE id = ?`,
        [trimmedName, unit, category, brand, stockValue, status, image, id]
      );

      if (currentProduct.stock !== stockValue) {
        await runExecute(
          `INSERT INTO inventory_history
           (product_id, old_quantity, new_quantity, changed_by)
           VALUES (?, ?, ?, ?)`,
          [id, currentProduct.stock, stockValue, 'admin']
        );
      }

      const updatedProduct = await runGet('SELECT * FROM products WHERE id = ?', [id]);
      return res.json(updatedProduct);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await runGet('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await runExecute('DELETE FROM products WHERE id = ?', [id]);
    await runExecute('DELETE FROM inventory_history WHERE product_id = ?', [id]);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/import', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const rows = [];
  const cleanup = () => fsPromises.unlink(req.file.path).catch(() => {});

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      try {
        if (!rows.length) {
          await cleanup();
          return res.status(400).json({ error: 'CSV file is empty' });
        }

        const summary = { added: 0, skipped: 0, duplicates: [] };

        for (const row of rows) {
          const name = (row.name || '').trim();
          if (!name) {
            summary.skipped += 1;
            continue;
          }

          const payload = {
            unit: row.unit || null,
            category: row.category || null,
            brand: row.brand || null,
            stock: Number.parseInt(row.stock, 10) || 0,
            status: row.status || 'In Stock',
            image: row.image || null,
          };

          const duplicate = await runGet(
            'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
            [name]
          );

          if (duplicate) {
            summary.duplicates.push({ name, existingId: duplicate.id });
            summary.skipped += 1;
            continue;
          }

          await runExecute(
            `INSERT INTO products (name, unit, category, brand, stock, status, image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, payload.unit, payload.category, payload.brand, payload.stock, payload.status, payload.image]
          );
          summary.added += 1;
        }

        await cleanup();
        return res.json(summary);
      } catch (error) {
        await cleanup();
        return res.status(500).json({ error: 'Error processing CSV file' });
      }
    })
    .on('error', async () => {
      await cleanup();
      return res.status(500).json({ error: 'Error reading CSV file' });
    });
});

router.get('/export', async (_req, res) => {
  try {
    const rows = await runAll('SELECT * FROM products ORDER BY name');
    const headers = ['name', 'unit', 'category', 'brand', 'stock', 'status', 'image'];
    let csvContent = `${headers.join(',')}\n`;

    rows.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] ? String(row[header]) : '';
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += `${values.join(',')}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const history = await runAll(
      `SELECT * FROM inventory_history
       WHERE product_id = ?
       ORDER BY datetime(change_date) DESC`,
      [id]
    );
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
