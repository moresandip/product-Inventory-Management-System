const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const HistorySidebar = ({ product, history, loading, onClose }) => {
  return (
    <aside className={`history-sidebar ${product ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <h2>Inventory History</h2>
          {product && <p>{product.name}</p>}
        </div>
        {product && (
          <button className="text-button" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      {!product && <p className="empty-state">Select a product to view history</p>}

      {product && (
        <div className="history-list">
          {loading ? (
            <p>Loading history…</p>
          ) : history.length === 0 ? (
            <p className="empty-state">No inventory changes yet</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="history-card">
                <div>
                  <p className="history-date">{formatDate(entry.change_date)}</p>
                  <p className="history-user">Changed by: {entry.changed_by || '—'}</p>
                </div>
                <div className="history-quantities">
                  <span>Old: {entry.old_quantity}</span>
                  <span>New: {entry.new_quantity}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};

export default HistorySidebar;

