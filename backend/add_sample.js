const db = require('./db');

const products = [
  ['Laptop', 'pcs', 'Electronics', 'Dell', 5, 'In Stock'],
  ['T-Shirt', 'pcs', 'Clothing', 'Nike', 20, 'In Stock'],
  ['Apple', 'kg', 'Food', 'Organic Farms', 50, 'In Stock'],
  ['Smartphone', 'pcs', 'Electronics', 'Samsung', 8, 'In Stock'],
  ['Jeans', 'pcs', 'Clothing', 'Levi\'s', 15, 'In Stock'],
  ['Bread', 'pcs', 'Food', 'Bakery Co', 30, 'In Stock'],
  ['Headphones', 'pcs', 'Electronics', 'Sony', 12, 'In Stock'],
  ['Jacket', 'pcs', 'Clothing', 'Adidas', 10, 'In Stock'],
  ['Milk', 'liters', 'Food', 'Dairy Inc', 25, 'In Stock']
];

db.serialize(() => {
  products.forEach(product => {
    db.run(`INSERT INTO products (name, unit, category, brand, stock, status) VALUES (?, ?, ?, ?, ?, ?)`, product, function(err) {
      if (err) {
        console.error('Error adding product:', err);
      } else {
        console.log(`Product "${product[0]}" added with ID:`, this.lastID);
      }
    });
  });
  db.close();
});
