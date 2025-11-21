import { useEffect, useState } from 'react';

const ProductRow = ({ product, onUpdate, onDelete, onSelect, isSelected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(product);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues(product);
  }, [product]);

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.stopPropagation();
    setSaving(true);
    try {
      await onUpdate(product.id, formValues);
      setIsEditing(false);
    } catch (err) {
      // handled upstream
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (event) => {
    event.stopPropagation();
    setFormValues(product);
    setIsEditing(false);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(product.id);
  };

  const stockValue = isEditing ? Number(formValues.stock) || 0 : product.stock;
  const statusLabel = stockValue === 0 ? 'Out of Stock' : 'In Stock';
  const statusClass = stockValue === 0 ? 'status-out' : 'status-in';

  return (
    <tr
      className={isSelected ? 'selected-row' : ''}
      onClick={() => {
        if (!isEditing) {
          onSelect(product);
        }
      }}
    >
      <td className="image-cell" onClick={(e) => e.stopPropagation()}>
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-placeholder">
            {(product.name || '?').charAt(0).toUpperCase()}
          </div>
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={formValues.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
        ) : (
          <span className="product-name">{product.name}</span>
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={formValues.unit ?? ''}
            onChange={(e) => handleFieldChange('unit', e.target.value)}
          />
        ) : (
          product.unit || '—'
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={formValues.category ?? ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
          />
        ) : (
          product.category || '—'
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={formValues.brand ?? ''}
            onChange={(e) => handleFieldChange('brand', e.target.value)}
          />
        ) : (
          product.brand || '—'
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={formValues.stock ?? 0}
            onChange={(e) => handleFieldChange('stock', e.target.value)}
          />
        ) : (
          product.stock
        )}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <span className={`status-pill ${statusClass}`}>{statusLabel}</span>
      </td>
      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <>
            <button className="primary small" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="text-button" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="text-button" onClick={handleEdit}>
              Edit
            </button>
            <button className="danger small" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default ProductRow;

