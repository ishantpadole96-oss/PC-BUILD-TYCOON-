import React, { useState, useMemo } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { getComponentsByCategory, CATEGORIES } from '../../data/index';
import { checkCompatibility } from '../../engine/compatibility';
import { PriceTag } from '../common/PriceTag';
import './ComponentModal.css';

export function ComponentModal() {
  const activeCategory = useSiteStore((s) => s.activePickerCategory);
  const closePicker = useSiteStore((s) => s.closePicker);
  const setComponent = useSiteStore((s) => s.setComponent);
  const openDetail = useSiteStore((s) => s.openDetail);
  const currentBuild = useSiteStore((s) => s.currentBuild);
  const market = useSiteStore((s) => s.market);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price_asc' | 'price_desc' | 'perf_desc' | 'deals'
  const [hideIncompatible, setHideIncompatible] = useState(true);

  const categoryMeta = activeCategory
    ? (CATEGORIES.find(c => c.key === activeCategory) || { label: activeCategory, icon: '📦' })
    : { label: '', icon: '' };
  const allInCat = useMemo(() => activeCategory ? getComponentsByCategory(activeCategory) : [], [activeCategory]);

  // Extract unique brands
  const brands = ['ALL', ...new Set(allInCat.map(c => c.brand).filter(Boolean))];

  // Evaluate compatibility for each candidate
  const processedItems = useMemo(() => {
    if (!activeCategory) return [];
    return allInCat.map(candidate => {
      const testBuild = { ...currentBuild, [activeCategory]: candidate };
      const compResult = checkCompatibility(testBuild);
      const criticalIssues = compResult.issues.filter(i => i.severity === 'critical');
      const isCandidateCompatible = criticalIssues.length === 0;

      const mData = market.prices[candidate.id] || {
        currentPrice: candidate.basePrice,
        change24h: 0,
        discountPercent: 0,
        bestMerchant: 'Amazon',
        stockStatus: 'in_stock',
      };

      return {
        ...candidate,
        isCompatible: isCandidateCompatible,
        compatibilityIssues: compResult.issues,
        marketData: mData,
      };
    });
  }, [allInCat, currentBuild, activeCategory, market]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return processedItems
      .filter(item => {
        if (hideIncompatible && !item.isCompatible) return false;
        if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchModel = item.model.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchSocket = item.socket?.toLowerCase().includes(q);
          if (!matchModel && !matchBrand && !matchSocket) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.marketData.currentPrice - b.marketData.currentPrice;
        if (sortBy === 'price_desc') return b.marketData.currentPrice - a.marketData.currentPrice;
        if (sortBy === 'perf_desc') {
          const scoreA = a.specs?.performanceScore || 0;
          const scoreB = b.specs?.performanceScore || 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'deals') return (b.marketData.discountPercent || 0) - (a.marketData.discountPercent || 0);
        return 0; // Default ordering
      });
  }, [processedItems, hideIncompatible, selectedBrand, searchQuery, sortBy]);

  // Early return AFTER all hooks
  if (!activeCategory) return null;

  const handleSelect = (component) => {
    setComponent(activeCategory, component);
    closePicker();
  };

  return (
    <div className="modal-backdrop" onClick={closePicker}>
      <div className="component-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-category-chip">CHOOSE HARDWARE</span>
            <h2 className="modal-component-name">{categoryMeta.icon} Select {categoryMeta.label}</h2>
          </div>
          <button className="modal-close-btn" onClick={closePicker}>✕</button>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="picker-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${categoryMeta.label} by model, brand, socket...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="toolbar-controls">
            <div className="filter-group">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="picker-select">
                <option value="popular">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="perf_desc">Performance Score</option>
                <option value="deals">Biggest Discount / Deals</option>
              </select>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={hideIncompatible}
                onChange={(e) => setHideIncompatible(e.target.checked)}
              />
              <span>Hide Incompatible</span>
            </label>
          </div>

          {/* Brand Filter Chips */}
          <div className="brand-chips">
            {brands.map((b) => (
              <button
                key={b}
                className={`brand-chip ${selectedBrand === b ? 'active' : ''}`}
                onClick={() => setSelectedBrand(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="picker-list">
          {filteredItems.length === 0 ? (
            <div className="picker-empty">
              <span className="empty-icon">🔎</span>
              <p>No compatible {categoryMeta.label} found matching your filters.</p>
              {hideIncompatible && (
                <button className="btn-secondary" onClick={() => setHideIncompatible(false)}>
                  Show Incompatible Parts
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`picker-row ${!item.isCompatible ? 'row-incompatible' : ''}`}
              >
                <div className="picker-col-main">
                  <div className="picker-title-row">
                    <span className="picker-item-brand">{item.brand}</span>
                    <h3 className="picker-item-model">{item.model}</h3>
                    {item.isCompatible ? (
                      <span className="badge-compatible">✓ Compatible</span>
                    ) : (
                      <span className="badge-warning">⚠️ Incompatible Socket/Type</span>
                    )}
                  </div>

                  <p className="picker-item-desc">{item.description}</p>

                  {/* Specs Chips */}
                  <div className="picker-specs-chips">
                    {item.socket && <span className="spec-chip">Socket: {item.socket}</span>}
                    {item.specs?.cores && <span className="spec-chip">{item.specs.cores}C / {item.specs.threads}T</span>}
                    {item.specs?.vram && <span className="spec-chip">{item.specs.vram}GB {item.specs.vramType}</span>}
                    {item.specs?.capacity && <span className="spec-chip">{item.specs.capacity >= 1000 ? `${item.specs.capacity/1000}TB` : `${item.specs.capacity}GB`}</span>}
                    {item.specs?.speed && <span className="spec-chip">{item.specs.speed}MHz</span>}
                    {item.specs?.wattage && <span className="spec-chip">{item.specs.wattage}W</span>}
                    {item.specs?.formFactor && <span className="spec-chip">{item.specs.formFactor}</span>}
                    {item.specs?.tdpRating && <span className="spec-chip">TDP: {item.specs.tdpRating}W</span>}
                  </div>
                </div>

                <div className="picker-col-pricing">
                  <div className="picker-price-block">
                    <span className="merchant-label">Best on {item.marketData.bestMerchant}:</span>
                    <PriceTag
                      inrPrice={item.marketData.currentPrice}
                      discountPercent={item.marketData.discountPercent}
                      change24h={item.marketData.change24h}
                      size="medium"
                    />
                  </div>

                  <div className="picker-actions">
                    <button
                      className="btn-inspect"
                      onClick={() => openDetail(item)}
                      title="View Price History & All Retailers"
                    >
                      📈 Price History
                    </button>
                    <button
                      className="btn-select"
                      onClick={() => handleSelect(item)}
                    >
                      Choose Part
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
