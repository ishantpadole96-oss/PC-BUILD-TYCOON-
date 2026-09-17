import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameHUD } from '../layout/GameHUD';
import { WorkstationView } from '../workstation/WorkstationView';
import { OrdersView } from '../orders/OrdersView';
import { MarketplaceView } from '../marketplace/MarketplaceView';
import { InventoryView } from '../inventory/InventoryView';
import { RepairsView } from '../repairs/RepairsView';
import { ChallengesView } from '../challenges/ChallengesView';
import { ShopView } from '../shop/ShopView';
import { CommunityView } from '../community/CommunityView';
import { BenchmarkModal } from '../workstation/BenchmarkModal';
import { soundFx } from '../../utils/audio';
import './VirtualOS.css';

const DESKTOP_ICONS = [
  { id: 'orders', label: 'E-mail', icon: '📧' },
  { id: 'marketplace', label: 'Shop', icon: '🛒' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'repairs', label: 'Repairs', icon: '🔧' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
  { id: 'shop', label: 'Upgrade Shop', icon: '🏬' },
  { id: 'community', label: 'Community', icon: '🌐' },
  { id: 'workstation', label: 'Assembly Desk', icon: '🛠️' }
];

export function VirtualOS() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  
  // Keep track of which window is currently open (only allowing 1 window at a time for simplicity like in the screenshot)
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  
  const [benchModalOpen, setBenchModalOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(gameState === 'booting');

  useEffect(() => {
    if (gameState === 'booting') {
      soundFx.playPowerOn();
      const timer = setTimeout(() => {
        soundFx.playBootChime();
        setIsBooting(false);
        setGameState('desktop');
      }, 3000); // 3 second boot sequence
      return () => clearTimeout(timer);
    }
  }, [gameState, setGameState]);

  const openApp = (appId) => {
    soundFx.playWhoosh();
    setActiveTab(appId);
  };

  const closeApp = () => {
    soundFx.playClick();
    setActiveTab(null);
  };

  if (isBooting) {
    return (
      <div className="virtual-os-booting">
        <div className="boot-logo">⊞</div>
        <div className="boot-spinner"></div>
        <div className="boot-text">Starting TITAN OS...</div>
      </div>
    );
  }

  return (
    <div className="virtual-room">
      <div className="monitor-bezel">
        <div className="monitor-screen">
          
          <div className="os-desktop">
            <GameHUD />
            
            <div className="os-icons-column">
              {DESKTOP_ICONS.map((app) => (
                <div 
                  key={app.id} 
                  className={`os-icon ${activeTab === app.id ? 'active' : ''}`}
                  onClick={() => openApp(app.id)}
                  onMouseEnter={() => soundFx.playHover()}
                >
                  <span className="os-icon-emoji">{app.icon}</span>
                  <span className="os-icon-label">{app.label}</span>
                </div>
              ))}
            </div>

            {activeTab && (
              <div className="os-window">
                <div className="os-window-titlebar">
                  <span className="os-window-title">
                    {DESKTOP_ICONS.find(i => i.id === activeTab)?.icon} {DESKTOP_ICONS.find(i => i.id === activeTab)?.label}
                  </span>
                  <button className="os-window-close" onClick={closeApp}>✕</button>
                </div>
                <div className="os-window-content">
                  {activeTab === 'workstation' && <WorkstationView onOpenBenchmark={() => setBenchModalOpen(true)} />}
                  {activeTab === 'orders' && <OrdersView />}
                  {activeTab === 'marketplace' && <MarketplaceView />}
                  {activeTab === 'inventory' && <InventoryView />}
                  {activeTab === 'repairs' && <RepairsView />}
                  {activeTab === 'challenges' && <ChallengesView />}
                  {activeTab === 'shop' && <ShopView />}
                  {activeTab === 'community' && <CommunityView />}
                </div>
              </div>
            )}

            <div className="os-taskbar">
              <button className="os-start-btn" onClick={() => soundFx.playClick()}>⊞ Start</button>
              <div className="os-taskbar-clock">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <BenchmarkModal
              isOpen={benchModalOpen}
              onClose={() => setBenchModalOpen(false)}
            />
          </div>
        </div>
        <div className="monitor-stand-neck"></div>
        <div className="monitor-stand-base"></div>
      </div>
    </div>
  );
}
