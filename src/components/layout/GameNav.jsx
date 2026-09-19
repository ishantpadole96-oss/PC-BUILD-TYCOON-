// Game Navigation - 8 tycoon game tabs
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './GameNav.css';

export function GameNav() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const orders = useGameStore((s) => s.orders);
  const inventory = useGameStore((s) => s.inventory);
  const repairJobs = useGameStore((s) => s.repairJobs);
  const activeOrder = useGameStore((s) => s.activeOrder);
  const activeRepair = useGameStore((s) => s.activeRepair);
  const activeChallenge = useGameStore((s) => s.activeChallenge);

  const NAV_ITEMS = [
    {
      id: 'workstation',
      label: 'Workstation',
      icon: '🛠️',
      badge: (activeOrder || activeRepair || activeChallenge) ? '⚡' : null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📋',
      badge: orders.length > 0 ? orders.length : null,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: '🛒',
      badge: 'LIVE',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      badge: inventory.length > 0 ? inventory.length : null,
    },
    {
      id: 'repairs',
      label: 'Repairs',
      icon: '🔧',
      badge: repairJobs.length > 0 ? repairJobs.length : null,
    },
    {
      id: 'scrapper',
      label: 'Scrapper',
      icon: '♻️',
      badge: null,
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: '🏆',
      badge: null,
    },
    {
      id: 'shop',
      label: 'Shop Upgrade',
      icon: '🏬',
      badge: null,
    },
    {
      id: 'community',
      label: 'Community',
      icon: '🌐',
      badge: null,
    },
  ];

  return (
    <nav className="game-nav">
      <div className="game-nav-inner">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`game-nav-btn ${activeTab === item.id ? 'nav-active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.badge === 'LIVE' ? 'badge-live' : item.badge === '⚡' ? 'badge-active' : 'badge-count'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
