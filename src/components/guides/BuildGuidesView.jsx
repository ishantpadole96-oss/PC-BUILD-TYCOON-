import React from 'react';
import { useSiteStore } from '../../store/siteStore';
import { BUILD_GUIDES } from '../../data/buildGuides';
import { getComponentById } from '../../data/index';
import { formatCurrency } from '../../utils/currency';
import './BuildGuidesView.css';

export function BuildGuidesView() {
  const loadBuildFromComponents = useSiteStore((s) => s.loadBuildFromComponents);
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);

  const calculateGuidePrice = (componentsObj) => {
    return Object.values(componentsObj).reduce((sum, id) => {
      const comp = getComponentById(id);
      if (!comp) return sum;
      const mData = market.prices[id];
      return sum + (mData ? mData.currentPrice : comp.basePrice);
    }, 0);
  };

  return (
    <div className="guides-view">
      <div className="guides-header">
        <h2 className="guides-title">Featured PC Build Guides</h2>
        <p className="guides-sub">
          Carefully balanced, pre-tested component combinations optimized for maximum frame-rate value and thermal stability.
        </p>
      </div>

      <div className="guides-list">
        {BUILD_GUIDES.map((guide) => {
          const guidePrice = calculateGuidePrice(guide.components);

          return (
            <div key={guide.id} className="guide-card">
              <div className="guide-card-header">
                <div className="guide-title-block">
                  <div className="guide-badge-row">
                    <span className="guide-badge">{guide.badge}</span>
                    <span className="guide-res-pill">{guide.targetResolution}</span>
                  </div>
                  <h3 className="guide-name">{guide.title}</h3>
                  <p className="guide-tagline">{guide.tagline}</p>
                </div>

                <div className="guide-price-block">
                  <span className="guide-price-label">ESTIMATED LIVE COST</span>
                  <span className="guide-price-val">{formatCurrency(guidePrice, currency)}</span>
                  <span className="guide-fps-tag">⚡ {guide.estimatedFps}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="guide-highlights">
                {guide.highlights.map((h, i) => (
                  <span key={i} className="highlight-pill">✓ {h}</span>
                ))}
              </div>

              {/* Parts Summary Grid */}
              <div className="guide-parts-grid">
                {Object.entries(guide.components).map(([category, id]) => {
                  const comp = getComponentById(id);
                  if (!comp) return null;
                  const mData = market.prices[id];
                  const price = mData ? mData.currentPrice : comp.basePrice;

                  return (
                    <div key={category} className="guide-part-item">
                      <span className="part-cat-label">{category.toUpperCase()}</span>
                      <span className="part-name">{comp.brand} {comp.model}</span>
                      <span className="part-price">{formatCurrency(price, currency)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action */}
              <div className="guide-card-footer">
                <button
                  className="btn-load-guide"
                  onClick={() => loadBuildFromComponents(guide.components)}
                >
                  ⚡ Load this Build into Configurator
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
