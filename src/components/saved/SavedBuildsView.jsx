import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { getComponentById, CATEGORIES } from '../../data/index';
import { formatCurrency } from '../../utils/currency';
import './SavedBuildsView.css';

export function SavedBuildsView() {
  const savedBuilds = useSiteStore((s) => s.savedBuilds);
  const deleteSavedBuild = useSiteStore((s) => s.deleteSavedBuild);
  const loadBuildFromComponents = useSiteStore((s) => s.loadBuildFromComponents);
  const setActiveTab = useSiteStore((s) => s.setActiveTab);
  const market = useSiteStore((s) => s.market);
  const currency = useSiteStore((s) => s.currency);

  const [compareIds, setCompareIds] = useState([]);

  const calculateBuildPrice = (componentsObj) => {
    return Object.values(componentsObj).reduce((sum, id) => {
      const comp = getComponentById(id);
      if (!comp) return sum;
      const mData = market.prices[id];
      return sum + (mData ? mData.currentPrice : comp.basePrice);
    }, 0);
  };

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(i => i !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const buildA = savedBuilds.find(b => b.id === compareIds[0]);
  const buildB = savedBuilds.find(b => b.id === compareIds[1]);

  return (
    <div className="saved-view">
      <div className="saved-header">
        <div>
          <h2 className="saved-title">My Saved Builds & Side-by-Side Compare</h2>
          <p className="saved-sub">
            Review your custom saved computer builds, compare configurations side-by-side, or load one into the active builder.
          </p>
        </div>
        <button className="btn-new-build" onClick={() => setActiveTab('builder')}>
          🛠️ Open System Builder
        </button>
      </div>

      {/* Side-by-side Comparison Drawer if 2 selected */}
      {buildA && buildB && (
        <div className="compare-drawer">
          <div className="compare-header">
            <h3>⚡ Comparing Rigs: {buildA.name} vs {buildB.name}</h3>
            <button className="btn-close-compare" onClick={() => setCompareIds([])}>Close Compare ✕</button>
          </div>

          <div className="compare-grid">
            <div className="compare-col">
              <h4>{buildA.name}</h4>
              <span className="compare-price">{formatCurrency(calculateBuildPrice(buildA.components), currency)}</span>
              <div className="compare-parts-list">
                {CATEGORIES.map(cat => {
                  const comp = getComponentById(buildA.components[cat.key]);
                  return (
                    <div key={cat.key} className="compare-row">
                      <span className="cat-label">{cat.label}:</span>
                      <span className="comp-name">{comp ? `${comp.brand} ${comp.model}` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="compare-col">
              <h4>{buildB.name}</h4>
              <span className="compare-price">{formatCurrency(calculateBuildPrice(buildB.components), currency)}</span>
              <div className="compare-parts-list">
                {CATEGORIES.map(cat => {
                  const comp = getComponentById(buildB.components[cat.key]);
                  return (
                    <div key={cat.key} className="compare-row">
                      <span className="cat-label">{cat.label}:</span>
                      <span className="comp-name">{comp ? `${comp.brand} ${comp.model}` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Builds List */}
      {savedBuilds.length === 0 ? (
        <div className="saved-empty">
          <span className="empty-icon">📁</span>
          <h3>No Saved Builds Yet</h3>
          <p>Configure a machine in the System Builder and click "Save Rig" to store your configurations here.</p>
          <button className="btn-primary" onClick={() => setActiveTab('builder')}>
            Go to System Builder
          </button>
        </div>
      ) : (
        <div className="saved-grid">
          {savedBuilds.map((build) => {
            const totalPrice = calculateBuildPrice(build.components);
            const partCount = Object.values(build.components).filter(Boolean).length;
            const isSelectedForCompare = compareIds.includes(build.id);

            return (
              <div key={build.id} className={`saved-card ${isSelectedForCompare ? 'card-comparing' : ''}`}>
                <div className="saved-card-top">
                  <div className="saved-card-titles">
                    <div className="saved-name-row">
                      <h3 className="saved-build-name">{build.name}</h3>
                      {build.isCloudSynced && (
                        <span className="cloud-synced-pill" title="Saved dynamically to your Supabase PostgreSQL cloud database">
                          ☁️ Cloud Synced
                        </span>
                      )}
                    </div>
                    <span className="saved-date">Saved on {build.savedAt}</span>
                  </div>
                  <div className="saved-price-block">
                    <span className="saved-price-val">{formatCurrency(totalPrice, currency)}</span>
                    <span className="saved-part-count">{partCount}/8 Components</span>
                  </div>
                </div>

                <div className="saved-parts-chips">
                  {CATEGORIES.map((cat) => {
                    const comp = getComponentById(build.components[cat.key]);
                    if (!comp) return null;
                    return (
                      <span key={cat.key} className="saved-chip">
                        <strong>{cat.label}:</strong> {comp.model}
                      </span>
                    );
                  })}
                </div>

                <div className="saved-card-actions">
                  <button
                    className={`btn-compare ${isSelectedForCompare ? 'active' : ''}`}
                    onClick={() => toggleCompare(build.id)}
                  >
                    {isSelectedForCompare ? '✓ Selected to Compare' : '⚖️ Compare'}
                  </button>
                  <button
                    className="btn-load-saved"
                    onClick={() => loadBuildFromComponents(build.components)}
                  >
                    ⚡ Load into Builder
                  </button>
                  <button
                    className="btn-delete-saved"
                    onClick={() => deleteSavedBuild(build.id)}
                    title="Delete saved configuration"
                  >
                    🗑️
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
