import React, { useEffect } from 'react';
import { useSiteStore } from './store/siteStore';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteNav } from './components/layout/SiteNav';
import { SystemBuilderView } from './components/builder/SystemBuilderView';
import { LiveMarketView } from './components/market/LiveMarketView';
import { CatalogView } from './components/catalog/CatalogView';
import { BuildGuidesView } from './components/guides/BuildGuidesView';
import { BenchmarkView } from './components/benchmarks/BenchmarkView';
import { SavedBuildsView } from './components/saved/SavedBuildsView';
import { ComponentModal } from './components/builder/ComponentModal';
import { PriceHistoryModal } from './components/common/PriceHistoryModal';
import { ExportModal } from './components/common/ExportModal';
import './index.css';

export default function App() {
  const activeTab = useSiteStore((s) => s.activeTab);
  const autoMarketSync = useSiteStore((s) => s.autoMarketSync);
  const tickMarket = useSiteStore((s) => s.tickMarket);

  // Background Live Market Sync: updates prices and retailer quotes every 25 seconds
  useEffect(() => {
    if (!autoMarketSync) return;
    const interval = setInterval(() => {
      tickMarket();
    }, 25000);
    return () => clearInterval(interval);
  }, [autoMarketSync, tickMarket]);

  return (
    <div className="pc-site-app">
      {/* Top Application Bar with Dynamic Market Ticker */}
      <SiteHeader />

      {/* Main Tab Navigation */}
      <SiteNav />

      {/* Primary Viewport */}
      <main className="site-main-viewport">
        {activeTab === 'builder' && <SystemBuilderView />}
        {activeTab === 'market' && <LiveMarketView />}
        {activeTab === 'catalog' && <CatalogView />}
        {activeTab === 'guides' && <BuildGuidesView />}
        {activeTab === 'benchmarks' && <BenchmarkView />}
        {activeTab === 'saved' && <SavedBuildsView />}
      </main>

      {/* Hardware Picker Modal */}
      <ComponentModal />

      {/* Price History & Multi-Retailer Matrix Modal */}
      <PriceHistoryModal />

      {/* Specification Export Modal */}
      <ExportModal />

      {/* Global Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-logo-icon">⚡</span>
            <span><strong>PCPartPulse</strong> — Next-Generation PC Hardware Engine & Live Market Tracker</span>
          </div>
          <div className="footer-links">
            <span>Market Feeds: Amazon, Newegg, Best Buy, Micro Center, B&H</span>
            <span>•</span>
            <span>Prices fluctuate live with market supply & demand</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
