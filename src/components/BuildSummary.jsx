import { PerformanceGauge } from './PerformanceGauge';
import './BuildSummary.css';

export function BuildSummary({
  build,
  categories,
  compatibility,
  performance,
  totals,
  onClearBuild,
  onRemovePart,
  isOpen,
  onClose,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasAnyPart = totals.partCount > 0;

  return (
    <aside className={`build-summary ${isOpen ? 'open' : ''}`}>
      {/* Mobile close */}
      <button className="summary-close" onClick={onClose} aria-label="Close summary">✕</button>

      <div className="summary-header">
        <h2 className="summary-title">Your Build</h2>
        {hasAnyPart && (
          <button className="clear-btn" onClick={onClearBuild}>
            Clear All
          </button>
        )}
      </div>

      {/* Performance */}
      <PerformanceGauge score={performance} />

      {/* Stats row */}
      <div className="summary-stats">
        <div className="summary-stat">
          <span className="ss-label">Total Cost</span>
          <span className="ss-value accent">{formatPrice(totals.totalPrice)}</span>
        </div>
        <div className="summary-stat">
          <span className="ss-label">Power Draw</span>
          <span className="ss-value">{totals.totalPower}W</span>
        </div>
        <div className="summary-stat">
          <span className="ss-label">Parts</span>
          <span className="ss-value">{totals.partCount}/8</span>
        </div>
      </div>

      {/* Compatibility */}
      {(compatibility.errors.length > 0 || compatibility.warnings.length > 0) && (
        <div className="compat-section">
          <h3 className="compat-title">Compatibility</h3>
          {compatibility.errors.map((err, i) => (
            <div key={`e-${i}`} className="compat-item error">
              <span className="compat-icon">✕</span>
              <span className="compat-text">{err}</span>
            </div>
          ))}
          {compatibility.warnings.map((warn, i) => (
            <div key={`w-${i}`} className="compat-item warning">
              <span className="compat-icon">⚠</span>
              <span className="compat-text">{warn}</span>
            </div>
          ))}
        </div>
      )}

      {compatibility.errors.length === 0 && compatibility.warnings.length === 0 && hasAnyPart && (
        <div className="compat-section">
          <div className="compat-item success">
            <span className="compat-icon">✓</span>
            <span className="compat-text">All components compatible</span>
          </div>
        </div>
      )}

      {/* Parts list */}
      <div className="parts-list">
        {categories.map(cat => {
          const part = build[cat.key];
          return (
            <div key={cat.key} className={`part-slot ${part ? 'filled' : ''}`}>
              <div className="part-slot-header">
                <span className="part-slot-icon">{cat.icon}</span>
                <span className="part-slot-label">{cat.label}</span>
              </div>
              {part ? (
                <div className="part-slot-info">
                  <div className="part-slot-details">
                    <span className="part-slot-brand">{part.brand}</span>
                    <span className="part-slot-model">{part.model}</span>
                    <span className="part-slot-price">{formatPrice(part.basePrice)}</span>
                  </div>
                  <button
                    className="part-remove"
                    onClick={() => onRemovePart(cat.key)}
                    aria-label={`Remove ${part.model}`}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="part-slot-empty">Not selected</span>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
