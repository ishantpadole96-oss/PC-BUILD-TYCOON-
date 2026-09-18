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

  return (
    <div className="os-window-content wallpaper-settings-content">
      <div className="os-window-header-internal">
        <h2>Personalization</h2>
      </div>
      
      <div className="wallpaper-settings-body">
        <p>Select an image or dynamic video (.mp4, .webm) from your PC to set as the TitanOS background.</p>
        
        <div className="default-wallpapers-section">
          <h3>Default Wallpapers</h3>
          <div className="default-wallpapers-grid">
            {['/wallpaper.jpg', '/wallpaper_1.jpg', '/wallpaper_2.jpg', '/wallpaper_3.jpg', '/wallpaper_4.jpg'].map((wp, index) => (
              <div 
                key={index} 
                className="default-wallpaper-thumb"
                onClick={() => {
                  soundFx.playSuccess();
                  setWallpaper({ type: 'image', url: wp });
                  clearWallpaper().catch(console.error); // Clear custom to use default
                }}
              >
                <img src={wp} alt={`Wallpaper ${index + 1}`} />
              </div>
            ))}
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
