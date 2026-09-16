import React from 'react';
import { useSiteStore } from '../../store/siteStore';
import './SiteNav.css';

export function SiteNav() {
  const activeTab = useSiteStore((s) => s.activeTab);
  const setActiveTab = useSiteStore((s) => s.setActiveTab);
  const savedBuilds = useSiteStore((s) => s.savedBuilds);
  const currentBuild = useSiteStore((s) => s.currentBuild);

  const partsCount = Object.values(currentBuild).filter(Boolean).length;

  const NAV_ITEMS = [
    { id: 'builder', label: 'System Builder', icon: '🛠️', badge: partsCount > 0 ? `${partsCount}/8` : null },
    { id: 'market', label: 'Live Market & Prices', icon: '📈', badge: 'LIVE' },
    { id: 'catalog', label: 'Component Catalog', icon: '🔍', badge: '120+' },
    { id: 'guides', label: 'Build Guides', icon: '🏆', badge: 'Curated' },
    { id: 'benchmarks', label: 'FPS & Bottlenecks', icon: '⚡', badge: null },
    { id: 'saved', label: 'Saved Builds', icon: '💾', badge: savedBuilds.length || null },
  ];

  return (
    <nav className="site-nav">
      <div className="site-nav-container">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-tab-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-tab-icon">{item.icon}</span>
            <span className="nav-tab-label">{item.label}</span>
            {item.badge && (
              <span className={`nav-tab-badge badge-${item.id}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
