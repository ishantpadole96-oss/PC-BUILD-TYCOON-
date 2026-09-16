import './Header.css';

export function Header({ totalPrice, partCount, onToggleSummary, showSummary }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <span className="logo-icon">⚙️</span>
            <div className="logo-glow" />
          </div>
          <div className="header-title-group">
            <h1 className="header-title">PC Simulator</h1>
            <p className="header-subtitle">Build Your Dream Machine</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-chip">
            <span className="stat-label">Total</span>
            <span className="stat-value price">{formatPrice(totalPrice)}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Parts</span>
            <span className="stat-value">{partCount}/8</span>
          </div>
          <button
            className={`summary-toggle ${showSummary ? 'active' : ''}`}
            onClick={onToggleSummary}
            aria-label="Toggle build summary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animated bottom line */}
      <div className="header-accent-line" />
    </header>
  );
}
