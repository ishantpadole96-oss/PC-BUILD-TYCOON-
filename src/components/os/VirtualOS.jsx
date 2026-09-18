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
import { BrowserView } from './BrowserView';
import { FileManagerView } from './FileManagerView';
import { MiniGameView } from './MiniGameView';
import { NotepadView } from './NotepadView';
import { BenchmarkModal } from '../workstation/BenchmarkModal';
import { TutorialOverlay } from '../common/TutorialOverlay';
import { soundFx } from '../../utils/audio';
import { getWallpaperBlob } from '../../utils/idb';
import './VirtualOS.css';
import { TitanKartView } from './TitanKartView';

const DESKTOP_ICONS = [
  { id: 'titankart', label: 'TitanKart', icon: '🛍️' },
  { id: 'browser', label: 'Web Browser', icon: '🌐' },
  { id: 'notepad', label: 'Notepad', icon: '📝' },
  { id: 'files', label: 'File Manager', icon: '📁' },
  { id: 'minigame', label: 'Mini Game', icon: '🎮' },
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
              <div className="boot-logo"><img src="/logo.png" alt="Boot Logo" style={{ width: '100px', borderRadius: '12px' }} /></div>
              <div className="boot-text">Loading TitanOS v2.0...</div>
            </div>
          ) : (
            <div 
              className="os-desktop" 
              style={(!wallpaper || wallpaper?.type === 'image') ? { backgroundImage: wallpaper?.url ? `url(${wallpaper.url})` : 'url(/wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {wallpaper?.type === 'video' && (
                <video 
                  key={wallpaper.url}
                  src={wallpaper.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="dynamic-wallpaper-video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', transform: 'translateZ(0)' }}
                />
              )}
              
              <GameHUD />
              <TutorialOverlay />
              
              {/* Top Menu Bar (macOS style) */}
              <div className="os-taskbar" style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <button 
                    className={`os-start-btn ${showStartMenu ? 'active' : ''}`} 
                    onClick={() => {
                      soundFx.playClick();
                      setShowStartMenu(!showStartMenu);
                    }}
                  >
                    
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', cursor: 'default' }}>TitanOS</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>File</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>Edit</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>View</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>Go</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>Window</span>
                  <span style={{ fontSize: '13px', cursor: 'default' }}>Help</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '14px', cursor: 'default' }}>🔋 100%</span>
                  <span style={{ fontSize: '14px', cursor: 'default' }}>📶</span>
                  <div className="os-taskbar-clock" style={{ fontWeight: '500', fontSize: '13px', cursor: 'default' }}>
                    {new Date().toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Apple Menu Dropdown */}
              {showStartMenu && (
                <div className="os-start-menu">
                  <div className="os-start-menu-items">
                    <button className="os-start-menu-item" onClick={() => { soundFx.playClick(); setShowStartMenu(false); }}>
                      <span>About This PC</span>
                    </button>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                    <button className="os-start-menu-item" onClick={() => { soundFx.playClick(); useGameStore.getState().exportSaveToFile(); setShowStartMenu(false); }}>
                      <span>Export Save File...</span>
                    </button>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                    <button className="os-start-menu-item" onClick={handleShutDown}>
                      <span>Shut Down...</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Dock (macOS style) */}
              <div className="os-dock" style={{ zIndex: 1 }}>
                {DESKTOP_ICONS.map((app) => (
                  <div 
                    key={app.id} 
                    className={`os-icon ${activeTab === app.id ? 'active' : ''}`}
                    onClick={() => openApp(app.id)}
                    onMouseEnter={() => soundFx.playHover()}
                  >
                    <div className="os-icon-tooltip">{app.label}</div>
                    <span className="os-icon-emoji">{app.icon}</span>
                    {activeTab === app.id && <div className="os-icon-indicator" />}
                  </div>
                ))}
              </div>

              {activeTab && (
                <div className="os-window">
                  <div className="os-window-titlebar">
                    <div className="os-window-controls">
                      <button className="os-window-btn os-window-close" onClick={closeApp}></button>
                      <button className="os-window-btn os-window-min"></button>
                      <button className="os-window-btn os-window-max"></button>
                    </div>
                    <span className="os-window-title">
                      {DESKTOP_ICONS.find(i => i.id === activeTab)?.label}
                    </span>
                    <div style={{ width: '52px' }}></div> {/* Balance flex space */}
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
                    {activeTab === 'browser' && <BrowserView />}
                    {activeTab === 'titankart' && <TitanKartView />}
                    {activeTab === 'files' && <FileManagerView />}
                    {activeTab === 'minigame' && <MiniGameView />}
                    {activeTab === 'notepad' && <NotepadView />}
                  </div>
                </div>
              )}

            <BenchmarkModal
              isOpen={benchModalOpen}
              onClose={() => setBenchModalOpen(false)}
            />
          </div>
        )}
        </div>
        <div className="monitor-stand-neck"></div>
        <div className="monitor-stand-base"></div>
      </div>
    </div>
  );
}
