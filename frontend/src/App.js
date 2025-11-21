import { useCallback, useEffect, useRef, useState } from 'react';
import api from './api/client';
import ProductTable from './components/ProductTable';
import HistorySidebar from './components/HistorySidebar';
import AddProductModal from './components/AddProductModal';
import './App.css';

const LIMIT_OPTIONS = [10, 20, 50, 100];

function App() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response?.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      setError('');

      try {
        if (searchQuery.trim()) {
          const response = await api.get('/products/search', {
            params: { name: searchQuery.trim() },
          });
          setProducts(Array.isArray(response?.data) ? response.data : []);
          setPagination(null);
        } else {
          const response = await api.get('/products', {
            params: {
              page: targetPage,
              limit,
              category: selectedCategory || undefined,
            },
          });
          const payload = response?.data || {};
          setProducts(Array.isArray(payload.products) ? payload.products : []);
          setPagination(payload.pagination || null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [limit, page, searchQuery, selectedCategory]
  );

  const fetchHistory = useCallback(async (productId) => {
    if (!productId) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await api.get(`/products/${productId}/history`);
      setHistory(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load inventory history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [limit, searchQuery, selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      fetchHistory(selectedProduct.id);
    } else {
      setHistory([]);
    }
  }, [selectedProduct, fetchHistory]);

  const handleUpdateProduct = async (id, values) => {
    try {
      const payload = {
        ...values,
        stock: Number(values.stock) || 0,
        name: values.name.trim(),
      };
      const response = await api.put(`/products/${id}`, payload);
      const updated = response?.data;
      if (!updated) {
        throw new Error('Missing response data');
      }
      setProducts((prev) => prev.map((product) => (product.id === id ? updated : product)));
      if (selectedProduct?.id === id) {
        setSelectedProduct(updated);
        fetchHistory(id);
      }
      showToast('Product updated successfully');
      return updated;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update product';
      showToast(message, 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    const product = products.find((item) => item.id === id);
    const confirmation = window.confirm(
      `Are you sure you want to delete ${product?.name || 'this product'}?`
    );
    if (!confirmation) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
        setHistory([]);
      }
      showToast('Product deleted');
      loadProducts(page);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product', 'error');
    }
  };

  const handleAddProduct = async (values) => {
    try {
      const payload = {
        ...values,
        stock: Number(values.stock) || 0,
        name: values.name.trim(),
      };
      const response = await api.post('/products', payload);
      if (!response?.data) {
        throw new Error('Missing response data');
      }
      showToast('Product added successfully');
      setIsAddModalOpen(false);
      setPage(1);
      await loadProducts(1);
      fetchCategories();
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to add product';
      showToast(message, 'error');
      throw err;
    }
  };

  const handleImport = async (file) => {
    if (!file) {
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      const response = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const summary = response?.data || { added: 0, skipped: 0 };
      showToast(`Import complete • Added: ${summary.added} • Skipped: ${summary.skipped}`);
      loadProducts(page);
      fetchCategories();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Failed to import products';
      showToast(message, 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/products/export', { responseType: 'blob' });
      const blobSource = response?.data ?? '';
      const url = window.URL.createObjectURL(new Blob([blobSource]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showToast('Failed to export products', 'error');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track products, stock status, and inventory history.</p>
        </div>
        <button className="primary" onClick={() => setIsAddModalOpen(true)}>
          Add New Product
        </button>
      </header>

      <section className="toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <button
            className="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <button className="secondary" onClick={handleExport}>
            Export CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileChange}
          />
        </div>
      </section>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="content">
        <div className="table-wrapper">
          <ProductTable
            products={products}
            loading={loading}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            onSelect={handleSelectProduct}
            selectedId={selectedProduct?.id}
          />

          {pagination && pagination.pages > 0 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {pagination.pages || 1}
              </span>
              <button
                disabled={pagination.pages === 0 || page === pagination.pages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <HistorySidebar
          product={selectedProduct}
          history={history}
          loading={historyLoading}
          onClose={() => setSelectedProduct(null)}
        />
      </div>

      {isAddModalOpen && (
        <AddProductModal
          categories={categories}
          onCancel={() => setIsAddModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}
    </div>
  );
}

export default App;
