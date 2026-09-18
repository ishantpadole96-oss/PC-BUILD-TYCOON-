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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [windowState, setWindowState] = useState('normal');
  const [isBooting, setIsBooting] = useState(gameState === 'booting');
  const wallpaper = useGameStore((s) => s.wallpaper);
  const setWallpaper = useGameStore((s) => s.setWallpaper);

  const [icons, setIcons] = useState(() => {
    const saved = localStorage.getItem('desktop_icons_order');
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        return [...DESKTOP_ICONS].sort((a, b) => {
          let indexA = savedIds.indexOf(a.id);
          let indexB = savedIds.indexOf(b.id);
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          return indexA - indexB;
        });
      } catch {}
    }
    return DESKTOP_ICONS;
  });
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newIcons = [...icons];
    const draggedItem = newIcons[draggedIdx];
    newIcons.splice(draggedIdx, 1);
    newIcons.splice(targetIdx, 0, draggedItem);
    
    setIcons(newIcons);
    localStorage.setItem('desktop_icons_order', JSON.stringify(newIcons.map(i => i.id)));
    setDraggedIdx(null);
  };

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

  const closeApp = (e) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    setActiveTab(null);
    setWindowState('normal');
  };

  const handleMin = (e) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    setWindowState(prev => prev === 'compact' ? 'normal' : 'compact');
  };

  const handleMax = (e) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized');
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
              
              {/* Desktop Icons (Grid) */}
              <div className="os-icons-column" style={{ zIndex: 1 }}>
                {icons.map((app, idx) => (
                  <div 
                    key={app.id} 
                    className={`os-icon ${activeTab === app.id ? 'active' : ''}`}
                    onClick={() => openApp(app.id)}
                    onMouseEnter={() => soundFx.playHover()}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                  >
                    <span className="os-icon-emoji" style={{ pointerEvents: 'none' }}>{app.icon}</span>
                    <span className="os-icon-label" style={{ display: 'block', fontSize: '11px', color: 'white', marginTop: '5px', textShadow: '1px 1px 2px black', pointerEvents: 'none' }}>{app.label}</span>
                  </div>
                ))}
              </div>

              {activeTab && (
                <div 
                  className="os-window"
                  style={{
                    ...(windowState === 'maximized' ? { top: '65px', left: 0, right: 0, bottom: '40px', borderRadius: 0 } : {}),
                    ...(windowState === 'compact' ? { top: '150px', left: '150px', right: '150px', bottom: '150px' } : {})
                  }}
                >
                  <div className="os-window-titlebar">
                    <div className="os-window-controls">
                      <button className="os-window-btn os-window-close" onClick={closeApp}></button>
                      <button className="os-window-btn os-window-min" onClick={handleMin}></button>
                      <button className="os-window-btn os-window-max" onClick={handleMax}></button>
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

              {/* Bottom Taskbar */}
              <div className="os-taskbar" style={{ zIndex: 2, top: 'auto', bottom: 0, borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
                  <button 
                    className={`os-start-btn ${showStartMenu ? 'active' : ''}`} 
                    onClick={() => {
                      soundFx.playClick();
                      setShowStartMenu(!showStartMenu);
                      setShowSearchMenu(false);
                    }}
                  >
                    ⊞ Start
                  </button>
                  <div className="os-taskbar-search" style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Type here to search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setShowSearchMenu(true);
                        setShowStartMenu(false);
                      }}
                      onBlur={() => setTimeout(() => setShowSearchMenu(false), 200)}
                      style={{ padding: '4px 10px 4px 30px', borderRadius: '15px', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '12px', width: '200px' }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>🔍</span>
                  </div>
                  
                  {/* Search Menu Popup */}
                  {showSearchMenu && (
                    <div style={{
                      position: 'absolute',
                      bottom: '45px',
                      left: '80px',
                      width: '320px',
                      maxHeight: '400px',
                      background: 'rgba(20, 20, 20, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px',
                      zIndex: 100,
                      boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
                      overflowY: 'auto'
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Best Matches</div>
                      {DESKTOP_ICONS.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase())).map(app => (
                        <div 
                          key={app.id} 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            openApp(app.id);
                            setShowSearchMenu(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; soundFx.playHover(); }}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{app.icon}</span>
                          <span>{app.label}</span>
                        </div>
                      ))}
                      
                      {searchQuery.trim().length > 0 && (
                        <>
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>
                          <div 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              openApp('browser');
                              setShowSearchMenu(false);
                              setSearchQuery('');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              color: 'white',
                              fontSize: '13px',
                              transition: 'background 0.1s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; soundFx.playHover(); }}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '1.4rem' }}>🌐</span>
                            <span>Search Web for "{searchQuery}"</span>
                          </div>
                        </>
                      )}

                      {DESKTOP_ICONS.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                          No apps found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '14px', cursor: 'default' }}>🔋 100%</span>
                  <span style={{ fontSize: '14px', cursor: 'default' }}>📶</span>
                  <div className="os-taskbar-clock" style={{ fontWeight: '500', fontSize: '13px', cursor: 'default' }}>
                    {new Date().toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Start Menu Dropdown */}
              {showStartMenu && (
                <div className="os-start-menu" style={{ bottom: '40px', top: 'auto' }}>
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
