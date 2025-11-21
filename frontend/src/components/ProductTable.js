import ProductRow from './ProductRow';

const ProductTable = ({ products, loading, onUpdate, onDelete, onSelect, selectedId }) => {
  const hasProducts = products.length > 0;

  return (
    <div className="product-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hasProducts ? (
            products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSelect={onSelect}
                isSelected={selectedId === product.id}
              />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="empty-state">
                {loading ? 'Loading products…' : 'No products found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

