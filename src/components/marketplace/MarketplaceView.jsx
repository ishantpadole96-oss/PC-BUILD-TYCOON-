// Dynamic Component Marketplace
// Real-time fluctuating hardware prices, historical trend graphs, flash sales, and purchasing
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ALL_COMPONENTS, CATEGORIES } from '../../data/index';

export function MarketplaceView() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cash = useGameStore((s) => s.cash);
  const buyComponent = useGameStore((s) => s.buyComponent);
  const market = useGameStore((s) => s.market);

  // Aggregate all components or filter by category
  let items = [];
  if (selectedCategory === 'all') {
    Object.values(ALL_COMPONENTS).forEach((arr) => {
      items = [...items, ...arr];
    });
  } else {
    items = ALL_COMPONENTS[selectedCategory] || [];
  }

  // Filter by tier
  if (selectedTier !== 'all') {
    items = items.filter((item) => item.tier === selectedTier);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    items = items.filter(
      (item) =>
        item.model.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (item.socket && item.socket.toLowerCase().includes(q))
    );
  }

  return (
    <div className="marketplace-page">
      {/* Top Header & Market Event Banner */}
      <div className="page-header">
        <div>
          <h2 className="page-title">🛒 COMPONENT HARDWARE MARKETPLACE</h2>
          <p className="page-subtitle">
            Source high-grade PC components directly from distributors. Prices fluctuate dynamically with global supply & demand.
          </p>
        </div>
      </div>

      {/* Active Market Event News Ticker */}
      {market.activeEvent && (
        <div className="market-event-card">
          <div className="event-badge">GLOBAL MARKET ALERT</div>
          <div className="event-info">
            <h4 className="event-title">{market.activeEvent.title}</h4>
            <p className="event-desc">{market.activeEvent.description}</p>
          </div>
          <div className="event-timer">
            <span>Duration Remaining:</span>
            <strong>{market.eventDaysRemaining} In-Game Days</strong>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="market-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search model, brand, socket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search"
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-filter"
          >
            <option value="all">All Components</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tier:</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="select-filter"
          >
            <option value="all">All Tiers</option>
            <option value="budget">Budget</option>
            <option value="mid">Mid-Range</option>
            <option value="high">High-End</option>
            <option value="enthusiast">Enthusiast</option>
          </select>
        </div>
      </div>

      {/* Components Grid */}
      <div className="components-grid">
        {items.map((item) => {
          const priceData = market.prices[item.id] || {
            currentPrice: item.basePrice,
            change24h: 0,
            discountPercent: 0,
          };
          const price = priceData.currentPrice;
          const change = priceData.change24h;
          const isDiscounted = priceData.discountPercent > 0;
          const canAfford = cash >= price;

          const history = market.history[item.id] || [item.basePrice];
          const minHist = Math.min(...history);
          const maxHist = Math.max(...history);
          const range = maxHist - minHist || 1;

          return (
            <div key={item.id} className="component-market-card">
              <div className="card-top">
                <span className="card-cat-tag">
                  {CATEGORIES.find((c) => c.key === item.category)?.icon} {item.category.toUpperCase()}
                </span>
                <span className={`tier-tag tier-${item.tier}`}>{item.tier.toUpperCase()}</span>
              </div>

              <h4 className="comp-model">{item.model}</h4>
              <span className="comp-brand">{item.brand}</span>

              {/* Specs Chips */}
              <div className="comp-specs-chips">
                {item.socket && <span className="chip">Socket: {item.socket}</span>}
                {item.powerDraw && <span className="chip">Power: {item.powerDraw}W</span>}
                {item.specs?.cores && <span className="chip">{item.specs.cores} Cores</span>}
                {item.specs?.vram && <span className="chip">{item.specs.vram}GB VRAM</span>}
                {item.specs?.capacity && <span className="chip">{item.specs.capacity}GB</span>}
                {item.specs?.wattage && <span className="chip">{item.specs.wattage}W</span>}
                {item.specs?.length && <span className="chip">{item.specs.length}mm</span>}
              </div>

              {/* 7-Day Trend Sparkline */}
              <div className="sparkline-box">
                <span className="sparkline-title">7-Day Price Trend:</span>
                <svg className="sparkline-svg" viewBox="0 0 100 24">
                  <polyline
                    fill="none"
                    stroke={change < 0 ? '#10b981' : '#f59e0b'}
                    strokeWidth="2.2"
                    points={history
                      .map((val, idx) => {
                        const x = (idx / (history.length - 1 || 1)) * 96 + 2;
                        const y = 22 - ((val - minHist) / range) * 18;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>

              {/* Pricing & Purchase Button */}
              <div className="card-footer">
                <div className="price-stack">
                  <div className="current-price-row">
                    <span className="price-tag">₹{price.toLocaleString('en-IN')}</span>
                    {change !== 0 && (
                      <span className={`change-badge ${change < 0 ? 'change-down' : 'change-up'}`}>
                        {change < 0 ? `▼ ${Math.abs(change)}%` : `▲ +${change}%`}
                      </span>
                    )}
                  </div>
                  {isDiscounted && (
                    <span className="discount-tag">🔥 {priceData.discountPercent}% FLASH DEAL</span>
                  )}
                </div>

                <button
                  onClick={() => buyComponent(item, price)}
                  disabled={!canAfford}
                  className={`btn-buy ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
                  title={canAfford ? `Purchase for ₹${price.toLocaleString('en-IN')}` : 'Insufficient cash in bank'}
                >
                  {canAfford ? 'Buy Part' : 'No Funds'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
