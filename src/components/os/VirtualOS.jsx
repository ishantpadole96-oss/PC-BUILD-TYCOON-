import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSiteStore } from '../../store/siteStore';
import { GameHUD } from '../layout/GameHUD';
import { WorkstationView } from '../workstation/WorkstationView';
import { OrdersView } from '../orders/OrdersView';
import { MarketplaceView } from '../marketplace/MarketplaceView';
import { InventoryView } from '../inventory/InventoryView';
import { RepairsView } from '../repairs/RepairsView';
import { ChallengesView } from '../challenges/ChallengesView';
import { ShopView } from '../shop/ShopView';
import { TitanNetworkView } from './TitanNetworkView';
import { DonateView } from './DonateView';
import { ContactView } from './ContactView';
import { WallpaperSettings } from './WallpaperSettings';
import { LockScreen } from './LockScreen';
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
import { AssetManagerView } from './AssetManagerView';
import { ScrapperView } from '../scrapper/ScrapperView';
import { TerminalView } from './TerminalView';
import { CalculatorView } from './CalculatorView';
import { SettingsView } from './SettingsView';
import { AppStoreView } from './AppStoreView';
import { OS_APPS } from './appsConfig';

const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animFrameId;

    const loop = (currentTime) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      animFrameId = requestAnimationFrame(loop);
    };
    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#0f0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', zIndex: 9999, pointerEvents: 'none', fontWeight: 'bold', fontSize: '14px', border: '1px solid rgba(0,255,0,0.3)' }}>
      {fps} FPS
    </div>
  );
};

export function VirtualOS() {
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const user = useSiteStore((s) => s.user);
  
  // Keep track of which window is currently open (only allowing 1 window at a time for simplicity like in the screenshot)
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const installedApps = useGameStore((s) => s.installedApps) || [];
  
  const [benchModalOpen, setBenchModalOpen] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [searchHighlightIdx, setSearchHighlightIdx] = useState(0);
  const [browserSearchQuery, setBrowserSearchQuery] = useState(null);
  const [windowState, setWindowState] = useState('maximized');
  const [isBooting, setIsBooting] = useState(gameState === 'booting');
  const wallpaper = useGameStore((s) => s.wallpaper);
  const setWallpaper = useGameStore((s) => s.setWallpaper);
  const osSettings = useGameStore((s) => s.osSettings) || { accentColor: '#0078d7', showFPS: false };
  const isLocked = useGameStore((s) => s.isLocked);

  const [openApps, setOpenApps] = useState([]);

  useEffect(() => {
    soundFx.setVolume(osSettings.soundVolume / 100);
    soundFx.uiSoundsEnabled = osSettings.uiSounds;
  }, [osSettings.soundVolume, osSettings.uiSounds]);

  useEffect(() => {
    if (activeTab && !openApps.includes(activeTab)) {
      setOpenApps(prev => [...prev, activeTab]);
    }
  }, [activeTab, openApps]);

  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Allow default behavior for normal typing in inputs, textareas, or contenteditables
      const isInput = e.target.tagName === 'INPUT' || 
                      e.target.tagName === 'TEXTAREA' || 
                      e.target.isContentEditable || 
                      e.isComposing;

      // --- Shift + Tab (App Switcher) ---
      if (e.key === 'Tab' && e.shiftKey && !isInput) {
        e.preventDefault();
        setIsAppSwitcherOpen(true);
        setOpenApps((prevOpenApps) => {
          if (prevOpenApps.length === 0) return prevOpenApps;
          const currentIndex = useGameStore.getState().activeTab 
            ? prevOpenApps.indexOf(useGameStore.getState().activeTab) 
            : -1;
          const nextIndex = (currentIndex + 1) % prevOpenApps.length;
          useGameStore.getState().setActiveTab(prevOpenApps[nextIndex]);
          return prevOpenApps;
        });
        return;
      }

      // --- Shift + Key Shortcuts ---
      if (e.shiftKey && !isInput) {
        // Prevent default only for mapped keys to not block all shift typing if somehow outside input
        const code = e.code;
        const currentActiveTab = useGameStore.getState().activeTab;

        // Helper to open app
        const quickOpen = (id) => {
          soundFx.playWhoosh();
          useGameStore.getState().setActiveTab(id);
          setWindowState('maximized');
        };
        
        switch (code) {
          case 'KeyZ':
            e.preventDefault();
            if (currentActiveTab) {
              setOpenApps(prev => prev.filter(app => app !== currentActiveTab));
              useGameStore.getState().setActiveTab(null);
              setWindowState('normal');
              soundFx.playClick();
            }
            break;
          case 'KeyW':
            e.preventDefault();
            if (currentActiveTab) {
              setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized');
              soundFx.playClick();
            }
            break;
          case 'KeyH':
            e.preventDefault();
            if (currentActiveTab) {
              useGameStore.getState().setActiveTab(null);
              soundFx.playClick();
            }
            break;
          case 'Digit4':
            e.preventDefault();
            soundFx.playPowerClick();
            useGameStore.getState().saveGame().then(() => {
              useGameStore.getState().setGameState('landing');
            });
            break;
          case 'Enter':
            e.preventDefault();
            setShowStartMenu(prev => !prev);
            soundFx.playClick();
            break;
          case 'Slash': e.preventDefault(); quickOpen('settings'); break;
          case 'KeyS': e.preventDefault(); quickOpen('settings'); break;
          case 'KeyT': e.preventDefault(); quickOpen('cmd'); break;
          case 'KeyB': e.preventDefault(); quickOpen('browser'); break;
          case 'KeyF': e.preventDefault(); quickOpen('files'); break;
          case 'KeyN': e.preventDefault(); quickOpen('notepad'); break;
          case 'KeyC': e.preventDefault(); quickOpen('calculator'); break;
          case 'KeyD': e.preventDefault(); quickOpen('workstation'); break;
          case 'KeyI': e.preventDefault(); quickOpen('inventory'); break;
          case 'KeyO': e.preventDefault(); quickOpen('orders'); break;
          case 'KeyE': e.preventDefault(); quickOpen('titanstore'); break;
          case 'KeyM': e.preventDefault(); quickOpen('marketplace'); break;
        }

        // Shift + 1-9 Taskbar shortcuts
        if (code.startsWith('Digit') && code !== 'Digit0' && code !== 'Digit4') {
           e.preventDefault();
           const num = parseInt(code.replace('Digit', ''));
           const installedAppsNow = useGameStore.getState().installedApps || [];
           const activeTaskbarIcons = OS_APPS.filter(app => installedAppsNow.includes(app.id));
           if (num - 1 < activeTaskbarIcons.length) {
             quickOpen(activeTaskbarIcons[num - 1].id);
           }
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsAppSwitcherOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const activeDesktopIcons = OS_APPS.filter(app => installedApps.includes(app.id));
    const saved = localStorage.getItem('desktop_icons_order');
    let sortedIcons = [...activeDesktopIcons];
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        sortedIcons.sort((a, b) => {
          let indexA = savedIds.indexOf(a.id);
          let indexB = savedIds.indexOf(b.id);
          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;
          return indexA - indexB;
        });
      } catch {}
    }
    setIcons(sortedIcons);
  }, [installedApps]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, targetIdx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(targetIdx);
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setIsDragging(false);
      setDragOverIdx(null);
      return;
    }
    
    const newIcons = [...icons];
    const draggedItem = newIcons[draggedIdx];
    newIcons.splice(draggedIdx, 1);
    newIcons.splice(targetIdx, 0, draggedItem);
    
    setIcons(newIcons);
    localStorage.setItem('desktop_icons_order', JSON.stringify(newIcons.map(i => i.id)));
    setDraggedIdx(null);
    setIsDragging(false);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      setDraggedIdx(null);
      setIsDragging(false);
      setDragOverIdx(null);
    }, 50);
  };

  const handleIconClick = (appId) => {
    if (!isDragging) {
      openApp(appId);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    let batteryCleanup = null;
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        batteryCleanup = () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      }).catch(() => {});
    }

    return () => {
      clearInterval(timer);
      if (batteryCleanup) batteryCleanup();
    };
  }, []);

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
        if (osSettings.bootChime !== false) soundFx.playBootChime();
        setIsBooting(false);
        setGameState('desktop');
      }, 3000); // 3 second boot sequence
      return () => clearTimeout(timer);
    }
  }, [gameState, setGameState, osSettings.bootChime]);

  const openApp = (appId) => {
    soundFx.playWhoosh();
    setActiveTab(appId);
    setWindowState('maximized');
  };

  const closeApp = (e) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    setOpenApps(prev => prev.filter(app => app !== activeTab));
    setActiveTab(null);
    setWindowState('normal');
    
    // If requirePasswordOnWake is true, lock the OS when an app is closed
    if (osSettings.requirePasswordOnWake && osSettings.osPassword) {
      useGameStore.getState().setIsLocked(true);
    }
  };

  const handleMin = (e) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    setActiveTab(null);
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
          ) : isLocked ? (
            <LockScreen />
          ) : (
            <div 
              className="os-desktop" 
              style={(!wallpaper || wallpaper?.type === 'image') ? { backgroundImage: wallpaper?.url ? `url(${wallpaper.url})` : 'url(/wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: osSettings.reduceMotion ? 'none' : undefined } : {}}
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
              {osSettings.showFPS && <FPSCounter />}
              
              {/* Desktop Icons (Grid) */}
              {!osSettings.hideDesktopIcons && (
                <div className="os-icons-column" style={{ zIndex: 1 }}>
                {icons.map((app, idx) => (
                  <div 
                    key={app.id} 
                    className={`os-icon ${activeTab === app.id ? 'active' : ''}`}
                    onClick={() => handleIconClick(app.id)}
                    onMouseEnter={() => soundFx.playHover()}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      opacity: draggedIdx === idx ? 0.4 : 1,
                      border: dragOverIdx === idx && draggedIdx !== idx ? '2px dashed rgba(0, 200, 255, 0.6)' : '1px solid transparent',
                      background: dragOverIdx === idx && draggedIdx !== idx ? 'rgba(0, 200, 255, 0.1)' : undefined,
                      transition: 'opacity 0.15s, border 0.15s, background 0.15s'
                    }}
                  >
                    <span className="os-icon-emoji" style={{ pointerEvents: 'none' }}>{app.icon}</span>
                    <span className="os-icon-label" style={{ display: 'block', fontSize: '11px', color: 'white', marginTop: '5px', textShadow: '1px 1px 2px black', pointerEvents: 'none' }}>{app.label}</span>
                  </div>
                ))}
                </div>
              )}

              {activeTab && (
                <div 
                  className="os-window"
                  style={{
                    ...(windowState === 'maximized' ? { top: '65px', left: 0, right: 0, bottom: '40px', borderRadius: 0 } : {}),
                    ...(windowState === 'compact' ? { top: '150px', left: '150px', right: '150px', bottom: '150px' } : {}),
                    background: osSettings.theme === 'light' ? `rgba(240, 240, 240, ${osSettings.windowOpacity / 100})` : `rgba(30, 30, 30, ${osSettings.windowOpacity / 100})`,
                    color: osSettings.theme === 'light' ? '#000' : '#fff'
                  }}
                >
                  <div className="os-window-titlebar">
                    <div className="os-window-controls">
                      <button className="os-window-btn os-window-close" onClick={closeApp}></button>
                      <button className="os-window-btn os-window-min" onClick={handleMin}></button>
                      <button className="os-window-btn os-window-max" onClick={handleMax}></button>
                    </div>
                    <span className="os-window-title">
                      {OS_APPS.find(i => i.id === activeTab)?.label}
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
                    {activeTab === 'titannetwork' && <TitanNetworkView />}
                    {activeTab === 'donate' && <DonateView />}
                    {activeTab === 'contact' && <ContactView />}
                    {activeTab === 'wallpaper' && <WallpaperSettings />}
                    {activeTab === 'browser' && <BrowserView initialSearchQuery={browserSearchQuery} onSearchConsumed={() => setBrowserSearchQuery(null)} />}
                    {activeTab === 'titankart' && <TitanKartView />}
                    {activeTab === 'assets' && <AssetManagerView />}
                    {activeTab === 'files' && <FileManagerView />}
                    {activeTab === 'minigame' && <MiniGameView />}
                    {activeTab === 'scrapper' && <ScrapperView />}
                    {activeTab === 'notepad' && <NotepadView />}
                    {activeTab === 'cmd' && <TerminalView />}
                    {activeTab === 'calculator' && <CalculatorView />}
                    {activeTab === 'settings' && <SettingsView />}
                    {activeTab === 'titanstore' && <AppStoreView />}
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
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchHighlightIdx(0); }}
                      onFocus={() => {
                        setShowSearchMenu(true);
                        setShowStartMenu(false);
                        setSearchHighlightIdx(0);
                      }}
                      onBlur={() => setTimeout(() => setShowSearchMenu(false), 200)}
                      onKeyDown={(e) => {
                        const searchApps = OS_APPS.filter(app => installedApps.includes(app.id));
                        const filtered = searchApps.filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()));
                        const hasWebOption = searchQuery.trim().length > 0;
                        const totalItems = filtered.length + (hasWebOption ? 1 : 0);

                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSearchHighlightIdx(prev => (prev + 1) % Math.max(totalItems, 1));
                          soundFx.playHover();
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSearchHighlightIdx(prev => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
                          soundFx.playHover();
                        } else if (e.key === 'Enter' && searchQuery.trim().length > 0) {
                          e.preventDefault();
                          if (searchHighlightIdx < filtered.length) {
                            openApp(filtered[searchHighlightIdx].id);
                          } else {
                            setBrowserSearchQuery(searchQuery);
                            openApp('browser');
                          }
                          setShowSearchMenu(false);
                          setSearchQuery('');
                          setSearchHighlightIdx(0);
                        } else if (e.key === 'Escape') {
                          setShowSearchMenu(false);
                          setSearchQuery('');
                          setSearchHighlightIdx(0);
                        }
                      }}
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
                      {OS_APPS.filter(app => installedApps.includes(app.id) && app.label.toLowerCase().includes(searchQuery.toLowerCase())).map((app, i) => (
                        <div 
                          key={app.id} 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            openApp(app.id);
                            setShowSearchMenu(false);
                            setSearchQuery('');
                          }}
                          onMouseEnter={() => { setSearchHighlightIdx(i); soundFx.playHover(); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            background: searchHighlightIdx === i ? 'rgba(255,255,255,0.1)' : 'transparent',
                            transition: 'background 0.1s'
                          }}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{app.icon}</span>
                          <span>{app.label}</span>
                        </div>
                      ))}
                      
                      {searchQuery.trim().length > 0 && (() => {
                        const webIdx = OS_APPS.filter(app => installedApps.includes(app.id) && app.label.toLowerCase().includes(searchQuery.toLowerCase())).length;
                        return (
                          <>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>
                            <div 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setBrowserSearchQuery(searchQuery);
                                openApp('browser');
                                setShowSearchMenu(false);
                                setSearchQuery('');
                              }}
                              onMouseEnter={() => { setSearchHighlightIdx(webIdx); soundFx.playHover(); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 10px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '13px',
                                background: searchHighlightIdx === webIdx ? 'rgba(255,255,255,0.1)' : 'transparent',
                                transition: 'background 0.1s'
                              }}
                            >
                              <span style={{ fontSize: '1.4rem' }}>🌐</span>
                              <span>Search Web for "{searchQuery}"</span>
                            </div>
                          </>
                        );
                      })()}

                      {OS_APPS.filter(app => installedApps.includes(app.id) && app.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                          No apps found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '15px', gap: '8px' }}>
                  {openApps.map(appId => {
                    const app = OS_APPS.find(i => i.id === appId) || { icon: '❓', label: 'Unknown' };
                    return (
                      <div
                        key={appId}
                        onClick={() => openApp(appId)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: activeTab === appId ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s',
                        }}
                        title={app.label}
                      >
                        <span style={{ fontSize: '1.2rem', pointerEvents: 'none' }}>{app.icon}</span>
                        <div style={{
                          position: 'absolute',
                          bottom: '-4px',
                          background: activeTab === appId ? (osSettings.accentColor || '#38bdf8') : 'rgba(255, 255, 255, 0.4)',
                          width: activeTab === appId ? '12px' : '6px',
                          height: '3px',
                          borderRadius: '2px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s',
                        }} />
                      </div>
                    )
                  })}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '14px', cursor: 'default' }} title={isCharging ? 'Charging' : 'Battery'}>
                    {isCharging ? '⚡' : '🔋'} {batteryLevel}%
                  </span>
                  <span style={{ fontSize: '14px', cursor: 'default', display: 'flex', alignItems: 'center' }} title="Ethernet Connected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="12" rx="2" ry="2"></rect>
                      <line x1="12" y1="16" x2="12" y2="20"></line>
                      <line x1="8" y1="20" x2="16" y2="20"></line>
                    </svg>
                  </span>
                  <div className="os-taskbar-clock" style={{ fontWeight: '500', fontSize: '13px', cursor: 'default' }}>
                    {currentTime.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: !osSettings.use24HourTime })}
                  </div>
                </div>
              </div>

              {/* Start Menu Dropdown */}
              {showStartMenu && (
                <div className="os-start-menu" style={{ 
                  bottom: '50px', 
                  top: 'auto', 
                  left: '20px', 
                  width: '600px', 
                  minHeight: '400px',
                  background: 'rgba(25, 25, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  
                  {/* Pinned Apps Grid */}
                  <div style={{ padding: '25px', flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Pinned Apps</span>
                      <button 
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => openApp('titanstore')}
                      >
                        All apps {'>'}
                      </button>
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(6, 1fr)', 
                      gap: '15px',
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}>
                      {OS_APPS.filter(app => installedApps.includes(app.id)).map(app => (
                        <div 
                          key={app.id}
                          onClick={() => {
                            soundFx.playWhoosh();
                            openApp(app.id);
                            setShowStartMenu(false);
                          }}
                          onMouseEnter={() => soundFx.playHover()}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 5px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '28px' }}>{app.icon}</span>
                          <span style={{ color: 'white', fontSize: '11px', textAlign: 'center', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{app.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile and Power Bar */}
                  <div style={{ 
                    padding: '15px 25px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {/* User Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: '#0078d7', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'white' 
                      }}>
                        {user ? (user.user_metadata?.full_name?.[0]?.toUpperCase() || '👤') : '👤'}
                      </div>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                        {user ? (user.user_metadata?.full_name || user.email?.replace('@titanos.com', '')) : 'Guest Builder'}
                      </span>
                    </div>

                    {/* Power Controls */}
                    <div style={{ display: 'flex', gap: '15px', color: 'white', fontSize: '18px' }}>
                      <button 
                        title="Settings"
                        onClick={() => {
                          soundFx.playClick();
                          openApp('settings');
                          setShowStartMenu(false);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        ⚙️
                      </button>
                      <button 
                        title="Export Save File"
                        onClick={() => {
                          soundFx.playClick();
                          useGameStore.getState().exportSaveToFile();
                          setShowStartMenu(false);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        💾
                      </button>
                      <button 
                        title="Shut Down"
                        onClick={handleShutDown}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        🔴
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* App Switcher Overlay (Shift+Tab) */}
              {isAppSwitcherOpen && openApps.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(20, 20, 25, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  gap: '15px',
                  zIndex: 9999,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  maxWidth: '80%',
                  overflowX: 'auto',
                }}>
                  {openApps.map(appId => {
                    const app = OS_APPS.find(a => a.id === appId);
                    const isActive = activeTab === appId;
                    return (
                      <div key={appId} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '15px 20px',
                        background: isActive ? `${osSettings.accentColor || '#0078d7'}40` : 'rgba(255,255,255,0.05)',
                        border: isActive ? `1px solid ${osSettings.accentColor || '#0078d7'}` : '1px solid transparent',
                        borderRadius: '8px',
                        minWidth: '100px',
                        transition: 'all 0.2s'
                      }}>
                        <span style={{ fontSize: '32px' }}>{app?.icon}</span>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal', textAlign: 'center' }}>
                          {app?.label}
                        </span>
                      </div>
                    );
                  })}
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
