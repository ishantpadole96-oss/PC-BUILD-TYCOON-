import React from 'react';
import { useSiteStore } from '../../store/siteStore';
import { formatCurrency } from '../../utils/currency';
import './PriceHistoryModal.css';

export function PriceHistoryModal() {
  const component = useSiteStore((s) => s.selectedComponentForDetail);
  const closeDetail = useSiteStore((s) => s.closeDetail);
  const setComponent = useSiteStore((s) => s.setComponent);
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);

  if (!component) return null;

  const marketData = market.prices[component.id] || {
    currentPrice: component.basePrice,
    basePrice: component.basePrice,
    change24h: 0,
    retailers: [],
    lowestPriceRecorded: component.basePrice,
    highestPriceRecorded: component.basePrice,
    stockStatus: 'in_stock',
  };

  const historyPoints = market.history[component.id] || [component.basePrice, marketData.currentPrice];
  const minPrice = Math.min(...historyPoints);
  const maxPrice = Math.max(...historyPoints);
  const priceRange = maxPrice - minPrice || 1;

  // Generate SVG path for 7-day sparkline
  const svgWidth = 460;
  const svgHeight = 120;
  const padding = 16;
  const graphWidth = svgWidth - padding * 2;
  const graphHeight = svgHeight - padding * 2;

  const points = historyPoints.map((val, idx) => {
    const x = padding + (idx / (historyPoints.length - 1)) * graphWidth;
    const y = svgHeight - padding - ((val - minPrice) / priceRange) * graphHeight;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  const handleAddToBuild = () => {
    setComponent(component.category, component);
    closeDetail();
  };

  return (
    <div className="modal-backdrop" onClick={closeDetail}>
      <div className="price-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-category-chip">{component.category.toUpperCase()}</span>
            <h2 className="modal-component-name">{component.brand} {component.model}</h2>
          </div>
          <button className="modal-close-btn" onClick={closeDetail}>✕</button>
        </div>

        <div className="modal-body">
          {/* Quick Metrics Bar */}
          <div className="market-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Best Live Price</span>
              <span className="metric-val highlight">{formatCurrency(marketData.currentPrice, currency)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">24h Price Move</span>
              <span className={`metric-val ${marketData.change24h < 0 ? 'text-green' : marketData.change24h > 0 ? 'text-red' : ''}`}>
                {marketData.change24h < 0 ? '▼' : marketData.change24h > 0 ? '▲' : '•'} {Math.abs(marketData.change24h)}%
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">30-Day Low</span>
              <span className="metric-val text-green">{formatCurrency(marketData.lowestPriceRecorded || minPrice, currency)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Stock Status</span>
              <span className={`stock-status-badge status-${marketData.stockStatus}`}>
                {marketData.stockStatus === 'in_stock' ? '● In Stock' : marketData.stockStatus === 'low_stock' ? '▲ Low Stock' : '✕ Out of Stock'}
              </span>
            </div>
          </div>

          {/* SVG Price History Graph */}
          <div className="chart-container">
            <div className="chart-header">
              <h4>7-Day Market Price Trend</h4>
              <span className="chart-sub">Fluctuations based on merchant API feeds</span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="price-svg-chart">
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

              {/* Shaded Area */}
              <path d={areaD} fill="url(#priceGradient)" />

              {/* Trend Line */}
              <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data points */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === points.length - 1 ? "4.5" : "2.5"}
                  fill={i === points.length - 1 ? "#34d399" : "#38bdf8"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            <div className="chart-axis-labels">
              <span>7 Days Ago</span>
              <span>4 Days Ago</span>
              <span>Today (Live)</span>
            </div>
          </div>

          {/* Multi-Retailer Price Comparison Matrix */}
          <div className="retailers-section">
            <h4>Live Retailer Comparison</h4>
            <div className="retailers-table-wrapper">
              <table className="retailers-table">
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Availability</th>
                    <th>Delivery / Shipping</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(marketData.retailers || []).map((r, i) => {
                    const isLowest = r.price === marketData.currentPrice;
                    return (
                      <tr key={i} className={isLowest ? 'row-best-price' : ''}>
                        <td>
                          <div className="merchant-name-cell">
                            <strong>{r.name}</strong>
                            {isLowest && <span className="best-price-badge">BEST PRICE</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`stock-cell ${r.inStock ? 'in-stock' : 'out-of-stock'}`}>
                            {r.inStock ? '✓ In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="shipping-cell">{r.shipping}</td>
                        <td className="price-cell">
                          <span className="retailer-price">{formatCurrency(r.price, currency)}</span>
                        </td>
                        <td>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="merchant-btn"
                          >
                            Visit Store ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={closeDetail}>Close</button>
          <button className="btn-primary" onClick={handleAddToBuild}>
            ➕ Add {component.model} to Current Build
          </button>
        </div>
      </div>
    </div>
  );
}
