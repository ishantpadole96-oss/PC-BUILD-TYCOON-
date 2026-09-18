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
import { DonateView } from './DonateView';
import { ContactView } from './ContactView';
import { WallpaperSettings } from './WallpaperSettings';
import { BenchmarkModal } from '../workstation/BenchmarkModal';
import { TutorialOverlay } from '../common/TutorialOverlay';
import { soundFx } from '../../utils/audio';
import { getWallpaperBlob } from '../../utils/idb';
import './VirtualOS.css';

const DESKTOP_ICONS = [
  { id: 'orders', label: 'E-mail', icon: '📧' },
  { id: 'marketplace', label: 'Shop', icon: '🛒' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'repairs', label: 'Repairs', icon: '🔧' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
  { id: 'shop', label: 'Upgrade Shop', icon: '🏬' },
  { id: 'community', label: 'Community', icon: '🌐' },
  { id: 'workstation', label: 'Assembly Desk', icon: '🛠️' },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️' },
  { id: 'donate', label: 'Donate', icon: '❤️' },
  { id: 'contact', label: 'Developer', icon: '📱' }
];

export function VirtualOS() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  
  // Keep track of which window is currently open (only allowing 1 window at a time for simplicity like in the screenshot)
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  
  const [benchModalOpen, setBenchModalOpen] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [isBooting, setIsBooting] = useState(gameState === 'booting');
  const wallpaper = useGameStore((s) => s.wallpaper);
  const setWallpaper = useGameStore((s) => s.setWallpaper);

  useEffect(() => {
    // Load wallpaper from IndexedDB on mount
    getWallpaperBlob().then((data) => {
      if (data && data.blob) {
        const url = URL.createObjectURL(data.blob);
        setWallpaper({ type: data.type, url });
      }
    }).catch(console.error);
  }, [setWallpaper]);

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

  const handleShutDown = async () => {
    soundFx.playPowerClick();
    await useGameStore.getState().saveGame();
    setGameState('landing');
  };

  return (
    <div className="virtual-room">
      <div className="monitor-bezel">
        <div className="monitor-screen">
          {isBooting ? (
            <div className="virtual-os-booting">
              <div className="boot-logo">⚡</div>
              <div className="boot-text">Loading TitanOS v2.0...</div>
            </div>
          ) : (
            <div 
              className="os-desktop" 
              style={wallpaper?.type === 'image' ? { backgroundImage: `url(${wallpaper.url})` } : {}}
            >
              {wallpaper?.type === 'video' && (
                <video 
                  src={wallpaper.url} 
                  autoPlay 
                  loop 
                  muted 
                  className="dynamic-wallpaper-video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                />
              )}
              
              <GameHUD />
              <TutorialOverlay />
              
              <div className="os-icons-column" style={{ zIndex: 1 }}>
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
                    {activeTab === 'donate' && <DonateView />}
                    {activeTab === 'contact' && <ContactView />}
                    {activeTab === 'wallpaper' && <WallpaperSettings />}
                  </div>
                </div>
              )}

              {/* Taskbar */}
              <div className="os-taskbar" style={{ zIndex: 2 }}>
                <button 
                  className={`os-start-btn ${showStartMenu ? 'active' : ''}`} 
                  onClick={() => {
                    soundFx.playClick();
                    setShowStartMenu(!showStartMenu);
                  }}
                >
              >
                ⊞ Start
              </button>
              
              {showStartMenu && (
                <div className="os-start-menu">
                  <div className="os-start-menu-sidebar">
                    <span className="os-start-menu-brand">TITAN OS</span>
                  </div>
                  <div className="os-start-menu-items">
                    <button className="os-start-menu-item" onClick={handleShutDown}>
                      <span className="icon">⏻</span>
                      <span>Save & Shut Down</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="os-taskbar-clock">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <BenchmarkModal
              isOpen={benchModalOpen}
              onClose={() => setBenchModalOpen(false)}
            />
            <TutorialOverlay />
          </div>
        </div>
        <div className="monitor-stand-neck"></div>
        <div className="monitor-stand-base"></div>
      </div>
    </div>
  );
}
