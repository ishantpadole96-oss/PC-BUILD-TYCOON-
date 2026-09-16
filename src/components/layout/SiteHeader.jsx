import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { formatCurrency, CURRENCIES } from '../../utils/currency';
import { CATEGORIES } from '../../data/index';
import { calcTotalPowerDraw } from '../../engine/compatibility';
import './SiteHeader.css';

export function SiteHeader() {
  const currency = useSiteStore((s) => s.currency);
  const setCurrency = useSiteStore((s) => s.setCurrency);
  const currentBuild = useSiteStore((s) => s.currentBuild);
  const market = useSiteStore((s) => s.market);
  const tickMarket = useSiteStore((s) => s.tickMarket);
  const setActiveTab = useSiteStore((s) => s.setActiveTab);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute build summary
  const selectedParts = CATEGORIES.filter(c => currentBuild[c.key]);
  const partsCount = selectedParts.length;
  const totalPower = calcTotalPowerDraw(currentBuild);

  const totalPrice = selectedParts.reduce((sum, cat) => {
    const item = currentBuild[cat.key];
    const mData = market.prices[item.id];
    return sum + (mData ? mData.currentPrice : item.basePrice);
  }, 0);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    tickMarket();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Get top 6 market movers for the ticker tape
  const marketMovers = Object.values(market.prices)
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 8);

  return (
    <header className="site-header">
      {/* Top Ticker Ribbon */}
      <div className="market-ticker-ribbon">
        <div className="ticker-label">
          <span className="live-dot"></span> LIVE MARKET:
        </div>
        <div className="ticker-scroll-content">
          {marketMovers.map((m) => (
            <div key={m.id} className="ticker-item">
              <span className="ticker-model">{m.model}</span>
              <span className="ticker-price">{formatCurrency(m.currentPrice, currency)}</span>
              <span className={`ticker-change ${m.change24h < 0 ? 'change-down' : m.change24h > 0 ? 'change-up' : 'change-flat'}`}>
                {m.change24h < 0 ? '▼' : m.change24h > 0 ? '▲' : '•'}{Math.abs(m.change24h)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="site-header-main">
        <div className="header-left">
          <div className="header-brand" onClick={() => setActiveTab('builder')} style={{ cursor: 'pointer' }}>
            <span className="brand-logo-icon">⚡</span>
            <div className="brand-text">
              <h1 className="brand-name">PCPartPulse</h1>
              <span className="brand-tagline">Dynamic System Builder & Market Intelligence</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* Live Market Pulse Control */}
          <div className="market-pulse-pill">
            <span className="pulse-indicator"></span>
            <span className="pulse-text">Sync: Live ({market.lastMarketUpdate || 'Active'})</span>
            <button
              className={`btn-refresh-market ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleManualRefresh}
              title="Trigger Live Market Fluctuation"
            >
              🔄 Refresh Prices
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="currency-selector">
            {Object.keys(CURRENCIES).map((code) => (
              <button
                key={code}
                className={`currency-btn ${currency === code ? 'active' : ''}`}
                onClick={() => setCurrency(code)}
              >
                {CURRENCIES[code].symbol} {code}
              </button>
            ))}
          </div>

          {/* Quick Build Summary Pill */}
          <div className="header-build-pill" onClick={() => setActiveTab('builder')}>
            <div className="build-pill-info">
              <span className="build-pill-label">CURRENT RIG</span>
              <span className="build-pill-cost">{formatCurrency(totalPrice, currency)}</span>
            </div>
            <div className="build-pill-meta">
              <span className="parts-badge">{partsCount}/8 Parts</span>
              <span className="watts-badge">⚡ {totalPower}W</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
