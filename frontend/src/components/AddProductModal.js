import { useState } from 'react';

const DEFAULT_FORM = {
  name: '',
  unit: '',
  category: '',
  brand: '',
  stock: 0,
  status: 'In Stock',
  image: '',
};

const AddProductModal = ({ categories, onCancel, onSave }) => {
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.name.trim()) {
      return;
    }
    setSaving(true);
    try {
      await onSave(formValues);
      setFormValues(DEFAULT_FORM);
    } catch (err) {
      // handled upstream
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Product</h2>
          <button className="text-button" onClick={onCancel}>
            Close
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label htmlFor="product-name">
            Name
            <input
              id="product-name"
              name="productName"
              type="text"
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </label>
          <label htmlFor="product-unit">
            Unit
            <input
              id="product-unit"
              name="productUnit"
              type="text"
              value={formValues.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            />
          </label>
          <label htmlFor="product-category">
            Category
            <input
              id="product-category"
              name="productCategory"
              type="text"
              list="category-options"
              value={formValues.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Start typing to select or add"
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label htmlFor="product-brand">
            Brand
            <input
              id="product-brand"
              name="productBrand"
              type="text"
              value={formValues.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
            />
          </label>
          <label htmlFor="product-stock">
            Stock
            <input
              id="product-stock"
              name="productStock"
              type="number"
              min="0"
              value={formValues.stock ?? 0}
              onChange={(e) => handleChange('stock', e.target.value)}
            />
          </label>
          <label htmlFor="product-status">
            Status
            <select
              id="product-status"
              name="productStatus"
              value={formValues.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </label>
          <label htmlFor="product-image">
            Image URL
            <input
              id="product-image"
              name="productImage"
              type="text"
              value={formValues.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://example.com/image.png"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="text-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

