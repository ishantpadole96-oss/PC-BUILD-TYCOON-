import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { CATEGORIES } from '../../data/index';
import { checkCompatibility, calcTotalPowerDraw } from '../../engine/compatibility';
import { formatCurrency } from '../../utils/currency';
import { PriceTag } from '../common/PriceTag';
import './SystemBuilderView.css';

export function SystemBuilderView() {
  const currentBuild = useSiteStore((s) => s.currentBuild);
  const removeComponent = useSiteStore((s) => s.removeComponent);
  const clearBuild = useSiteStore((s) => s.clearBuild);
  const openPicker = useSiteStore((s) => s.openPicker);
  const openDetail = useSiteStore((s) => s.openDetail);
  const setExportModalOpen = useSiteStore((s) => s.setExportModalOpen);
  const saveCurrentBuild = useSiteStore((s) => s.saveCurrentBuild);
  const setActiveTab = useSiteStore((s) => s.setActiveTab);
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);

  const [showIssuesDropdown, setShowIssuesDropdown] = useState(false);
  const [saveNamePrompt, setSaveNamePrompt] = useState(false);
  const [customRigName, setCustomRigName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Evaluate compatibility
  const compatibilityResult = checkCompatibility(currentBuild);
  const totalPower = calcTotalPowerDraw(currentBuild);

  // Calculate pricing
  const parts = CATEGORIES.map(c => currentBuild[c.key]).filter(Boolean);
  const totalPrice = parts.reduce((sum, item) => {
    const mData = market.prices[item.id];
    return sum + (mData ? mData.currentPrice : item.basePrice);
  }, 0);

  const basePriceTotal = parts.reduce((sum, item) => sum + item.basePrice, 0);
  const totalSavings = Math.max(0, basePriceTotal - totalPrice);

  // PSU stats
  const psuWattage = currentBuild.psu?.specs?.wattage || 0;
  const psuLoadPercent = psuWattage > 0 ? Math.min(100, Math.round((totalPower / psuWattage) * 100)) : 0;

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    saveCurrentBuild(customRigName.trim() || undefined);
    setCustomRigName('');
    setSaveNamePrompt(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="builder-view">
      {/* Top Banner Toolbar */}
      <div className="builder-header-toolbar">
        <div>
          <h2 className="builder-view-title">System Configurator</h2>
          <p className="builder-view-sub">
            Pick compatible components with live dynamic market prices and real-time retailer comparison.
          </p>
        </div>

        <div className="builder-action-btns">
          <button className="btn-tool" onClick={handleCopyLink}>
            {copiedLink ? '✓ Link Copied' : '🔗 Share Link'}
          </button>
          <button className="btn-tool" onClick={() => setExportModalOpen(true)}>
            📄 Export List
          </button>
          <button className="btn-tool" onClick={() => setSaveNamePrompt(true)}>
            💾 Save Rig
          </button>
          <button className="btn-tool btn-tool-danger" onClick={clearBuild}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Save Rig Inline Modal */}
      {saveNamePrompt && (
        <div className="inline-prompt-box">
          <form onSubmit={handleSaveSubmit} className="inline-prompt-form">
            <span className="prompt-icon">💾</span>
            <input
              type="text"
              placeholder="Name this build (e.g. My 1440p Battlestation)..."
              value={customRigName}
              onChange={(e) => setCustomRigName(e.target.value)}
              className="prompt-input"
              autoFocus
            />
            <button type="submit" className="btn-primary">Save to My Rigs</button>
            <button type="button" className="btn-secondary" onClick={() => setSaveNamePrompt(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Intelligence Metric Cards */}
      <div className="builder-intel-grid">
        {/* Compatibility Card */}
        <div className={`intel-card ${compatibilityResult.issues.some(i => i.severity === 'critical') ? 'intel-critical' : compatibilityResult.issues.length > 0 ? 'intel-warning' : 'intel-success'}`}>
          <div className="intel-card-header">
            <span className="intel-icon">
              {compatibilityResult.issues.some(i => i.severity === 'critical') ? '❌' : compatibilityResult.issues.length > 0 ? '⚠️' : '✓'}
            </span>
            <div className="intel-info">
              <span className="intel-label">COMPATIBILITY STATUS</span>
              <span className="intel-status-text">
                {compatibilityResult.issues.length === 0
                  ? 'All Parts 100% Compatible'
                  : `${compatibilityResult.issues.length} Issue(s) Detected`}
              </span>
            </div>
            {compatibilityResult.issues.length > 0 && (
              <button
                className="btn-expand-issues"
                onClick={() => setShowIssuesDropdown(!showIssuesDropdown)}
              >
                {showIssuesDropdown ? 'Hide ▲' : 'View Details ▼'}
              </button>
            )}
          </div>

          {showIssuesDropdown && compatibilityResult.issues.length > 0 && (
            <div className="issues-accordion">
              {compatibilityResult.issues.map((iss, idx) => (
                <div key={idx} className={`issue-item issue-${iss.severity}`}>
                  <span className="issue-msg">{iss.message}</span>
                  {iss.suggestion && <span className="issue-sug">💡 {iss.suggestion}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wattage & PSU Load Card */}
        <div className="intel-card intel-neutral">
          <div className="intel-card-header">
            <span className="intel-icon">⚡</span>
            <div className="intel-info">
              <span className="intel-label">ESTIMATED POWER DRAW</span>
              <span className="intel-status-text">
                ~{totalPower} Watts {psuWattage > 0 ? `/ ${psuWattage}W PSU (${psuLoadPercent}% load)` : ''}
              </span>
            </div>
          </div>
          <div className="wattage-meter-bar">
            <div
              className={`wattage-meter-fill ${psuLoadPercent > 85 ? 'fill-red' : psuLoadPercent > 70 ? 'fill-yellow' : 'fill-green'}`}
              style={{ width: `${Math.max(5, psuLoadPercent)}%` }}
            ></div>
          </div>
          <span className="meter-sub">
            {psuWattage > 0 
              ? (psuLoadPercent <= 75 ? 'Optimal PSU headroom maintained.' : '⚠️ High load; consider higher wattage.')
              : `Recommended PSU: ${Math.ceil(totalPower * 1.3 / 50) * 50 || 550}W+`}
          </span>
        </div>

        {/* Total Cost & Market Savings */}
        <div className="intel-card intel-neutral">
          <div className="intel-card-header">
            <span className="intel-icon">💎</span>
            <div className="intel-info">
              <span className="intel-label">TOTAL ESTIMATED PRICE</span>
              <span className="intel-price-val">{formatCurrency(totalPrice, currency)}</span>
            </div>
          </div>
          <div className="savings-info-row">
            {totalSavings > 0 ? (
              <span className="savings-text">🔥 Saved {formatCurrency(totalSavings, currency)} below MSRP via market deals!</span>
            ) : (
              <span className="savings-neutral">Based on lowest in-stock merchant quotes</span>
            )}
            <button className="btn-benchmark-link" onClick={() => setActiveTab('benchmarks')}>
              ⚡ Test FPS ↗
            </button>
          </div>
        </div>
      </div>

      {/* Component Slots Table */}
      <div className="builder-slots-table-wrapper">
        <table className="builder-slots-table">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Component</th>
              <th>Selection</th>
              <th style={{ width: '170px' }}>Best Merchant</th>
              <th style={{ width: '160px' }}>Live Price</th>
              <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => {
              const item = currentBuild[cat.key];
              const mData = item ? (market.prices[item.id] || {
                currentPrice: item.basePrice,
                bestMerchant: 'Amazon',
                discountPercent: 0,
                change24h: 0,
              }) : null;

              return (
                <tr key={cat.key} className={item ? 'slot-row-filled' : 'slot-row-empty'}>
                  {/* Category */}
                  <td className="slot-cat-cell">
                    <span className="slot-cat-icon">{cat.icon}</span>
                    <span className="slot-cat-label">{cat.label}</span>
                  </td>

                  {/* Component Details */}
                  <td className="slot-item-cell">
                    {item ? (
                      <div className="item-detail-block">
                        <div className="item-name-row">
                          <span className="item-brand">{item.brand}</span>
                          <span className="item-model">{item.model}</span>
                        </div>
                        <div className="item-specs-row">
                          {item.socket && <span className="slot-chip">{item.socket}</span>}
                          {item.specs?.cores && <span className="slot-chip">{item.specs.cores}C/{item.specs.threads}T</span>}
                          {item.specs?.vram && <span className="slot-chip">{item.specs.vram}GB {item.specs.vramType}</span>}
                          {item.specs?.capacity && <span className="slot-chip">{item.specs.capacity >= 1000 ? `${item.specs.capacity/1000}TB` : `${item.specs.capacity}GB`}</span>}
                          {item.specs?.speed && <span className="slot-chip">{item.specs.speed}MHz</span>}
                          {item.specs?.wattage && <span className="slot-chip">{item.specs.wattage}W</span>}
                          {item.specs?.formFactor && <span className="slot-chip">{item.specs.formFactor}</span>}
                          {item.powerDraw > 0 && <span className="slot-chip chip-power">⚡ {item.powerDraw}W</span>}
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn-pick-slot"
                        onClick={() => openPicker(cat.key)}
                      >
                        + Choose {cat.label}
                      </button>
                    )}
                  </td>

                  {/* Best Merchant */}
                  <td className="slot-merchant-cell">
                    {item ? (
                      <div className="merchant-quote">
                        <span className="merchant-name">{mData.bestMerchant}</span>
                        <span className="merchant-badge">Lowest Offer</span>
                      </div>
                    ) : (
                      <span className="slot-placeholder">—</span>
                    )}
                  </td>

                  {/* Live Price */}
                  <td className="slot-price-cell">
                    {item ? (
                      <PriceTag
                        inrPrice={mData.currentPrice}
                        discountPercent={mData.discountPercent}
                        change24h={mData.change24h}
                        size="medium"
                      />
                    ) : (
                      <span className="slot-placeholder">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="slot-action-cell">
                    {item ? (
                      <div className="slot-actions-group">
                        <button
                          className="btn-action-icon"
                          onClick={() => openDetail(item)}
                          title="View Price History & All Merchants"
                        >
                          📈
                        </button>
                        <button
                          className="btn-action-text"
                          onClick={() => openPicker(cat.key)}
                        >
                          Change
                        </button>
                        <button
                          className="btn-action-icon btn-remove"
                          onClick={() => removeComponent(cat.key)}
                          title="Remove from build"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-action-pick"
                        onClick={() => openPicker(cat.key)}
                      >
                        Select
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
