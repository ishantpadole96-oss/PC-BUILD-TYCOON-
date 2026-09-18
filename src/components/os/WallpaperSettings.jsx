import React, { useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { saveWallpaperBlob, clearWallpaper } from '../../utils/idb';
import { soundFx } from '../../utils/audio';
import './WallpaperSettings.css';

export function WallpaperSettings() {
  const fileInputRef = useRef(null);
  const setWallpaper = useGameStore((s) => s.setWallpaper);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      
      // Immediately apply wallpaper for the current session
      setWallpaper({ type, url });
      soundFx.playSuccess();
      
      // Attempt to save for future sessions (may fail in incognito)
      try {
        await saveWallpaperBlob(file, type);
      } catch (dbErr) {
        console.warn("Could not save wallpaper to local storage. It will reset on reload.", dbErr);
      }
    } catch (err) {
      console.error("Failed to load wallpaper", err);
    } finally {
      setLoading(false);
      e.target.value = null; // reset
    }
  };

  const handleReset = async () => {
    soundFx.playClick();
    setLoading(true);
    try {
      await clearWallpaper();
      setWallpaper(null);
    } finally {
      setLoading(false);
    }
  };

  const shopLevel = useGameStore((s) => s.shopLevel);
  
  const defaultWallpapers = [
    { url: '/wallpaper.jpg', level: 1 },
    { url: '/wallpaper_1.jpg', level: 1 },
    { url: '/wallpaper_2.jpg', level: 1 },
    { url: '/wallpaper_3.jpg', level: 2 },
    { url: '/wallpaper_4.jpg', level: 2 },
    { url: '/wp_cyberpunk.jpg', level: 3 },
    { url: '/wp_hardware.jpg', level: 4 },
    { url: '/wp_synthwave.jpg', level: 5 },
    { url: '/wp_server.jpg', level: 6 },
    { url: '/wp_cozy.jpg', level: 7 }
  ];

  return (
    <div className="os-window-content wallpaper-settings-content">
      <div className="os-window-header-internal">
        <h2>Personalization</h2>
      </div>
      
      <div className="wallpaper-settings-body">
        <p>Select an image or dynamic video (.mp4, .webm) from your PC to set as the TitanOS background.</p>
        
        <div className="default-wallpapers-section">
          <h3>Default Wallpapers (Unlock more via Shop upgrades!)</h3>
          <div className="default-wallpapers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
            {defaultWallpapers.map((wp, index) => {
              const isLocked = shopLevel < wp.level;
              return (
                <div 
                  key={index} 
                  className={`default-wallpaper-thumb ${isLocked ? 'locked' : ''}`}
                  style={{ 
                    position: 'relative', 
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    filter: isLocked ? 'grayscale(1)' : 'none'
                  }}
                  onClick={() => {
                    if (isLocked) {
                      soundFx.playError();
                      alert(`Requires Shop Level ${wp.level} to unlock!`);
                      return;
                    }
                    soundFx.playSuccess();
                    setWallpaper({ type: 'image', url: wp.url });
                    clearWallpaper().catch(console.error);
                  }}
                >
                  <img src={wp.url} alt={`Wallpaper ${index + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  {isLocked && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}>
                      🔒 Lv {wp.level}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="wallpaper-actions">
          <button 
            className="btn-select-wallpaper" 
            onClick={() => { soundFx.playClick(); fileInputRef.current?.click(); }}
            disabled={loading}
          >
            {loading ? 'Processing...' : '📁 Browse Files'}
          </button>
          
          <button 
            className="btn-reset-wallpaper" 
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Reset to Original
          </button>
        </div>
        
        <input 
          type="file" 
          accept="image/*,video/mp4,video/webm" 
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div className="wallpaper-info">
          <small>Note: Large video files are stored locally in your browser to save bandwidth and will not sync to the cloud.</small>
        </div>
      </div>
    </div>
  );
}
