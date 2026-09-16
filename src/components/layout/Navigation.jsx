// Navigation component for switching between Tycoon systems
import React from 'react';
import { useGameStore } from '../../store/gameStore';

export function Navigation() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const inventory = useGameStore((s) => s.inventory);
  const activeOrder = useGameStore((s) => s.activeOrder);
  const activeRepair = useGameStore((s) => s.activeRepair);
  const activeChallenge = useGameStore((s) => s.activeChallenge);

  const tabs = [
    { id: 'workstation', label: 'Workstation', icon: '🖥️', badge: activeOrder ? 'Active Build' : null },
    { id: 'orders', label: 'Orders', icon: '📋', badge: activeOrder ? '1 IN PROGRESS' : null },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒', badge: null },
    { id: 'inventory', label: 'Inventory', icon: '📦', badge: inventory.length > 0 ? inventory.length : null },
    { id: 'repairs', label: 'Repairs', icon: '🔧', badge: activeRepair ? 'REPAIR' : null },
    { id: 'challenges', label: 'Challenges', icon: '🏆', badge: activeChallenge ? 'ACTIVE' : null },
    { id: 'shop', label: 'Shop Upgrades', icon: '🏬', badge: null },
    { id: 'community', label: 'Community', icon: '🌐', badge: null },
  ];

  return (
    <nav className="game-nav">
      <div className="nav-container">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${isActive ? 'nav-tab-active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.badge && (
                <span className={`tab-badge ${tab.badge === 'Active Build' ? 'badge-active' : ''}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
