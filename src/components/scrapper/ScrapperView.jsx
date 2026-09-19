import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CATEGORIES } from '../../data/index';
import './ScrapperView.css';

export function ScrapperView() {
  const [filterCat, setFilterCat] = useState('all');

  const inventory = useGameStore((s) => s.inventory);
  const sellInventoryItem = useGameStore((s) => s.sellInventoryItem);
  const market = useGameStore((s) => s.market);

  const filtered = filterCat === 'all'
    ? inventory
    : inventory.filter((i) => i.category === filterCat);

  return (
    <div className="scrapper-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">♻️ PART SCRAPPER</h2>
          <p className="page-subtitle">
            Recycle old or mistakenly bought components for cash. New items sell for 95% of current market price, while replaced parts sell for 50%.
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="scrapper-filter-bar">
        <button
          className={`filter-chip ${filterCat === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCat('all')}
        >
          All ({inventory.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = inventory.filter((i) => i.category === cat.key).length;
          return (
            <button
              key={cat.key}
              className={`filter-chip ${filterCat === cat.key ? 'active' : ''}`}
              onClick={() => setFilterCat(cat.key)}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Scrapper Grid */}
      {filtered.length === 0 ? (
        <div className="empty-scrapper-box">
          <span className="empty-icon">♻️</span>
          <h3>No Parts to Scrap</h3>
          <p>Your inventory is empty in this category.</p>
        </div>
      ) : (
        <div className="scrapper-grid">
          {filtered.map((invItem) => {
            const currentMarketPrice = market.prices[invItem.componentId]?.currentPrice || invItem.purchasePrice;
            const isUsed = invItem.instanceId.startsWith('inv_rem_');
            const multiplier = isUsed ? 0.50 : 0.95;
            const resellValue = Math.round(currentMarketPrice * multiplier);

            return (
              <div key={invItem.instanceId} className="scrapper-card">
                <div className="card-header">
                  <span className="card-cat-badge">
                    {CATEGORIES.find((c) => c.key === invItem.category)?.icon} {invItem.category.toUpperCase()}
                  </span>
                  <span className={`condition-badge ${isUsed ? 'used' : 'new'}`}>
                    {isUsed ? 'REPLACED / USED' : 'NEW'}
                  </span>
                </div>

                <h4 className="item-model">{invItem.item.model}</h4>
                <span className="item-brand">{invItem.item.brand}</span>

                <div className="scrap-pricing">
                  <div className="price-row">
                    <span>Market Value:</span>
                    <span>₹{currentMarketPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="price-row">
                    <span>Scrap Rate:</span>
                    <span className={isUsed ? 'rate-low' : 'rate-high'}>
                      {isUsed ? '50%' : '95%'}
                    </span>
                  </div>
                  <div className="price-row total-scrap">
                    <span>You Get:</span>
                    <strong className="text-cash">₹{resellValue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <button
                  onClick={() => sellInventoryItem(invItem.instanceId)}
                  className="btn-primary btn-scrap"
                >
                  ♻️ Scrap Part
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
