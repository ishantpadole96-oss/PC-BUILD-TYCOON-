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
      await saveWallpaperBlob(file, type);
      
      const url = URL.createObjectURL(file);
      setWallpaper({ type, url });
      soundFx.playSuccess();
    } catch (err) {
      console.error("Failed to save wallpaper", err);
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
            🔄 Reset to Default
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
