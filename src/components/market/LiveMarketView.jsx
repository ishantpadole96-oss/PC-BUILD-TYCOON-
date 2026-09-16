import React, { useState, useMemo } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { ALL_COMPONENTS, CATEGORIES } from '../../data/index';
import { formatCurrency } from '../../utils/currency';
import { PriceTag } from '../common/PriceTag';
import './LiveMarketView.css';

export function LiveMarketView() {
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);
  const setComponent = useSiteStore((s) => s.setComponent);
  const openDetail = useSiteStore((s) => s.openDetail);
  const tickMarket = useSiteStore((s) => s.tickMarket);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('biggest_drop'); // 'biggest_drop' | 'biggest_rise' | 'price_asc' | 'price_desc'

  // Flatten all components with live market data
  const allItemsWithMarket = useMemo(() => {
    const list = [];
    Object.entries(ALL_COMPONENTS).forEach(([category, items]) => {
      items.forEach((item) => {
        const mData = market.prices[item.id] || {
          currentPrice: item.basePrice,
          basePrice: item.basePrice,
          change24h: 0,
          discountPercent: 0,
          bestMerchant: 'Amazon',
          stockStatus: 'in_stock',
        };
        const history = market.history[item.id] || [item.basePrice, mData.currentPrice];
        list.push({ ...item, marketData: mData, history });
      });
    });
    return list;
  }, [market]);

  // Find top price drops for featured cards
  const topDeals = useMemo(() => {
    return [...allItemsWithMarket]
      .sort((a, b) => a.marketData.change24h - b.marketData.change24h)
      .slice(0, 4);
  }, [allItemsWithMarket]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return allItemsWithMarket
      .filter((item) => {
        if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
        if (dealsOnly && (item.marketData.discountPercent <= 0 && item.marketData.change24h >= 0)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = item.model.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'biggest_drop') return a.marketData.change24h - b.marketData.change24h;
        if (sortBy === 'biggest_rise') return b.marketData.change24h - a.marketData.change24h;
        if (sortBy === 'price_asc') return a.marketData.currentPrice - b.marketData.currentPrice;
        if (sortBy === 'price_desc') return b.marketData.currentPrice - a.marketData.currentPrice;
        return 0;
      });
  }, [allItemsWithMarket, activeCategory, dealsOnly, searchQuery, sortBy]);

  // Mini Sparkline SVG Generator
  const renderSparkline = (historyPoints) => {
    if (!historyPoints || historyPoints.length < 2) return null;
    const width = 80;
    const height = 24;
    const min = Math.min(...historyPoints);
    const max = Math.max(...historyPoints);
    const range = max - min || 1;

    const pts = historyPoints.map((val, idx) => {
      const x = (idx / (historyPoints.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    const isFalling = historyPoints[historyPoints.length - 1] <= historyPoints[0];

    return (
      <svg width={width} height={height} className="sparkline-svg">
        <polyline
          fill="none"
          stroke={isFalling ? '#34d399' : '#f87171'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
        />
      </svg>
    );
  };

  return (
    <div className="market-view">
      {/* Header Banner */}
      <div className="market-view-header">
        <div>
          <h2 className="market-view-title">Live Hardware Market & Price Tracker</h2>
          <p className="market-view-sub">
            Real-time market feeds tracking volatility, retail stock status, and dynamic pricing across authorized distributors.
          </p>
        </div>
        <button className="btn-market-tick" onClick={tickMarket}>
          ⚡ Simulate Market Move
        </button>
      </div>

      {/* Active Macro Event Alert (if any) */}
      {market.activeEvent && (
        <div className="market-event-banner">
          <div className="event-icon">📢</div>
          <div className="event-details">
            <strong>{market.activeEvent.title}</strong>
            <p>{market.activeEvent.description}</p>
          </div>
          <span className="event-pill">Active Market Condition</span>
        </div>
      )}

      {/* Top 4 Flash Deals Spotlight */}
      <div className="market-spotlight-section">
        <h3 className="section-title">🔥 Biggest Price Drops Right Now</h3>
        <div className="deals-grid">
          {topDeals.map((deal) => (
            <div key={deal.id} className="deal-card" onClick={() => openDetail(deal)}>
              <div className="deal-card-header">
                <span className="deal-cat">{deal.category.toUpperCase()}</span>
                <span className="deal-drop-tag">
                  {deal.marketData.change24h < 0 ? `▼ ${Math.abs(deal.marketData.change24h)}%` : 'Deal'}
                </span>
              </div>
              <h4 className="deal-model">{deal.brand} {deal.model}</h4>
              <p className="deal-merchant">Best price on <strong>{deal.marketData.bestMerchant}</strong></p>
              <div className="deal-pricing-row">
                <PriceTag
                  inrPrice={deal.marketData.currentPrice}
                  discountPercent={deal.marketData.discountPercent}
                  change24h={deal.marketData.change24h}
                  size="medium"
                  showChange={false}
                />
                <button
                  className="btn-card-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    setComponent(deal.category, deal);
                  }}
                >
                  Add to Rig
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Market Table & Filters */}
      <div className="market-table-card">
        {/* Category Tabs */}
        <div className="market-category-tabs">
          <button
            className={`cat-tab ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            All Hardware ({allItemsWithMarket.length})
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`cat-tab ${activeCategory === c.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Search and Sort Toolbar */}
        <div className="market-table-toolbar">
          <div className="market-search-box">
            <input
              type="text"
              placeholder="Filter by product name, brand, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="market-toolbar-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={dealsOnly}
                onChange={(e) => setDealsOnly(e.target.checked)}
              />
              <span>Price Drops Only</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="market-select"
            >
              <option value="biggest_drop">Biggest Price Drops (24h)</option>
              <option value="biggest_rise">Largest Price Increases</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="market-table-wrapper">
          <table className="market-table">
            <thead>
              <tr>
                <th>Hardware Item</th>
                <th>MSRP</th>
                <th>Lowest Market Price</th>
                <th>24h Volatility</th>
                <th>7-Day Curve</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const mData = item.marketData;
                return (
                  <tr key={item.id} className="market-row">
                    <td>
                      <div className="market-item-info">
                        <span className="market-brand-sub">{item.brand} • {item.category.toUpperCase()}</span>
                        <strong className="market-model-title">{item.model}</strong>
                      </div>
                    </td>
                    <td className="msrp-cell">
                      {formatCurrency(item.basePrice, currency)}
                    </td>
                    <td>
                      <div className="best-price-cell">
                        <span className="price-bold">{formatCurrency(mData.currentPrice, currency)}</span>
                        <span className="best-merchant-tag">{mData.bestMerchant}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`volatility-pill ${mData.change24h < 0 ? 'drop' : mData.change24h > 0 ? 'rise' : 'neutral'}`}>
                        {mData.change24h < 0 ? '▼' : mData.change24h > 0 ? '▲' : '•'} {Math.abs(mData.change24h)}%
                      </span>
                    </td>
                    <td>
                      <div className="sparkline-wrapper">
                        {renderSparkline(item.history)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-dot-cell status-${mData.stockStatus}`}>
                        {mData.stockStatus === 'in_stock' ? '● In Stock' : mData.stockStatus === 'low_stock' ? '▲ Low Stock' : '✕ Out'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          className="btn-history-view"
                          onClick={() => openDetail(item)}
                        >
                          Offers & Chart ↗
                        </button>
                        <button
                          className="btn-add-build-quick"
                          onClick={() => setComponent(item.category, item)}
                        >
                          + Add
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
