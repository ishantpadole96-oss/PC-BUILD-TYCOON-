import React, { useState, useMemo } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { ALL_COMPONENTS, CATEGORIES } from '../../data/index';
import { PriceTag } from '../common/PriceTag';
import './CatalogView.css';

export function CatalogView() {
  const market = useSiteStore((s) => s.market);
  const setComponent = useSiteStore((s) => s.setComponent);
  const openDetail = useSiteStore((s) => s.openDetail);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all components
  const allComponents = useMemo(() => {
    const list = [];
    Object.entries(ALL_COMPONENTS).forEach(([category, items]) => {
      items.forEach((item) => {
        const mData = market.prices[item.id] || {
          currentPrice: item.basePrice,
          change24h: 0,
          discountPercent: 0,
          bestMerchant: 'Amazon',
          stockStatus: 'in_stock',
        };
        list.push({ ...item, marketData: mData });
      });
    });
    return list;
  }, [market]);

  // Extract available brands for the active category
  const availableBrands = useMemo(() => {
    const subset = activeCategory === 'ALL'
      ? allComponents
      : allComponents.filter(c => c.category === activeCategory);
    return ['ALL', ...new Set(subset.map(c => c.brand).filter(Boolean))];
  }, [allComponents, activeCategory]);

  // Filter
  const filtered = useMemo(() => {
    return allComponents.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
      if (selectedBrand !== 'ALL' && item.brand !== selectedBrand) return false;
      if (selectedTier !== 'ALL' && item.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.model.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allComponents, activeCategory, selectedBrand, selectedTier, searchQuery]);

  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <div>
          <h2 className="catalog-title">Hardware Component Catalog</h2>
          <p className="catalog-sub">
            Explore 120+ authentic PC components with live vendor quotes and detailed architectural specs.
          </p>
        </div>
      </div>

      {/* Categories Horizontal Selector */}
      <div className="catalog-categories-bar">
        <button
          className={`catalog-cat-btn ${activeCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => { setActiveCategory('ALL'); setSelectedBrand('ALL'); }}
        >
          All Categories ({allComponents.length})
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`catalog-cat-btn ${activeCategory === c.key ? 'active' : ''}`}
            onClick={() => { setActiveCategory(c.key); setSelectedBrand('ALL'); }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Filter Controls Row */}
      <div className="catalog-filters-row">
        <div className="catalog-search-wrap">
          <input
            type="text"
            placeholder="Search by model or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tier Pills */}
        <div className="catalog-tier-pills">
          {['ALL', 'budget', 'mid', 'high', 'enthusiast'].map((tier) => (
            <button
              key={tier}
              className={`tier-pill ${selectedTier === tier ? 'active' : ''}`}
              onClick={() => setSelectedTier(tier)}
            >
              {tier.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Brand Selector */}
        <div className="catalog-brand-wrap">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="brand-select"
          >
            {availableBrands.map((b) => (
              <option key={b} value={b}>{b === 'ALL' ? 'All Brands' : b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hardware Grid */}
      <div className="catalog-grid">
        {filtered.map((item) => (
          <div key={item.id} className="catalog-card" onClick={() => openDetail(item)}>
            <div className="catalog-card-top">
              <span className="card-brand">{item.brand}</span>
              <span className="card-cat-badge">{item.category.toUpperCase()}</span>
            </div>

            <h3 className="card-model">{item.model}</h3>
            <p className="card-desc">{item.description}</p>

            <div className="card-specs-list">
              {item.socket && <span className="card-spec-tag">Socket {item.socket}</span>}
              {item.specs?.cores && <span className="card-spec-tag">{item.specs.cores}C/{item.specs.threads}T</span>}
              {item.specs?.vram && <span className="card-spec-tag">{item.specs.vram}GB {item.specs.vramType}</span>}
              {item.specs?.capacity && <span className="card-spec-tag">{item.specs.capacity >= 1000 ? `${item.specs.capacity/1000}TB` : `${item.specs.capacity}GB`}</span>}
              {item.specs?.speed && <span className="card-spec-tag">{item.specs.speed}MHz</span>}
              {item.specs?.wattage && <span className="card-spec-tag">{item.specs.wattage}W</span>}
              {item.specs?.formFactor && <span className="card-spec-tag">{item.specs.formFactor}</span>}
              {item.specs?.readSpeed && <span className="card-spec-tag">{item.specs.readSpeed} MB/s</span>}
            </div>

            <div className="card-pricing-footer">
              <div className="card-price-stack">
                <span className="merchant-hint">Lowest on {item.marketData.bestMerchant}:</span>
                <PriceTag
                  inrPrice={item.marketData.currentPrice}
                  discountPercent={item.marketData.discountPercent}
                  change24h={item.marketData.change24h}
                  size="small"
                />
              </div>

              <button
                className="btn-card-add-rig"
                onClick={(e) => {
                  e.stopPropagation();
                  setComponent(item.category, item);
                }}
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
