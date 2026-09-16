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
  const user = useSiteStore((s) => s.user);
  const setAuthModalOpen = useSiteStore((s) => s.setAuthModalOpen);
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

          {/* User Account / Google Login Pill */}
          <button
            className={`header-auth-btn ${user ? 'logged-in' : ''}`}
            onClick={() => setAuthModalOpen(true)}
            title={user ? `Signed in as ${user.email}` : 'Sign in with Google to sync builds'}
          >
            {user ? (
              <div className="header-user-avatar">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User" className="avatar-img-sm" />
                ) : (
                  <span>{user.email?.[0]?.toUpperCase() || '👤'}</span>
                )}
                <span className="auth-name-tag">{user.user_metadata?.full_name?.split(' ')[0] || 'My Account'}</span>
              </div>
            ) : (
              <div className="header-signin-content">
                <svg className="google-icon-sm" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign In</span>
              </div>
            )}
          </button>

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
