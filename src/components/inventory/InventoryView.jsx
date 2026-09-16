// Inventory View - Warehouse storage of owned components, resale, and installation
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CATEGORIES } from '../../data/index';

export function InventoryView() {
  const [filterCat, setFilterCat] = useState('all');

  const inventory = useGameStore((s) => s.inventory);
  const sellInventoryItem = useGameStore((s) => s.sellInventoryItem);
  const installPartFromInventory = useGameStore((s) => s.installPartFromInventory);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const market = useGameStore((s) => s.market);

  const filtered = filterCat === 'all'
    ? inventory
    : inventory.filter((i) => i.category === filterCat);

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">📦 WORKSHOP INVENTORY ({inventory.length} ITEMS)</h2>
          <p className="page-subtitle">
            All components purchased or uninstalled are stored here. Install them directly into workstation builds or resell them back to the market.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('marketplace')}
          className="btn-primary"
        >
          🛒 Buy More Parts
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="inventory-filter-bar">
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

      {/* Inventory Grid */}
      {filtered.length === 0 ? (
        <div className="empty-inventory-box">
          <span className="empty-icon">📦</span>
          <h3>Inventory is Empty</h3>
          <p>You have no stored components in this category. Visit the marketplace to stock up!</p>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="btn-primary"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="inventory-grid">
          {filtered.map((invItem) => {
            const currentMarketPrice = market.prices[invItem.componentId]?.currentPrice || invItem.purchasePrice;
            const resellValue = Math.round(currentMarketPrice * 0.85);

            return (
              <div key={invItem.instanceId} className="inventory-card">
                <div className="card-header">
                  <span className="card-cat-badge">
                    {CATEGORIES.find((c) => c.key === invItem.category)?.icon} {invItem.category.toUpperCase()}
                  </span>
                  <span className="purchase-date">Purchased: ₹{invItem.purchasePrice.toLocaleString('en-IN')}</span>
                </div>

                <h4 className="item-model">{invItem.item.model}</h4>
                <span className="item-brand">{invItem.item.brand}</span>

                <div className="item-specs">
                  {invItem.item.socket && <span>Socket: {invItem.item.socket}</span>}
                  {invItem.item.powerDraw && <span>Power: {invItem.item.powerDraw}W</span>}
                  {invItem.item.specs?.vram && <span>VRAM: {invItem.item.specs.vram}GB</span>}
                  {invItem.item.specs?.capacity && <span>Capacity: {invItem.item.specs.capacity}GB</span>}
                </div>

                <div className="resell-row">
                  <span>Current Resale Value:</span>
                  <strong className="text-cash">₹{resellValue.toLocaleString('en-IN')}</strong>
                </div>

                <div className="inv-card-actions">
                  <button
                    onClick={() => {
                      installPartFromInventory(invItem);
                      setActiveTab('workstation');
                    }}
                    className="btn-primary btn-sm"
                  >
                    🛠️ Install to PC
                  </button>
                  <button
                    onClick={() => sellInventoryItem(invItem.instanceId)}
                    className="btn-secondary btn-sm btn-sell"
                    title={`Resell to market for ₹${resellValue.toLocaleString('en-IN')}`}
                  >
                    💰 Resell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
