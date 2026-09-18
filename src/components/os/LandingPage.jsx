import React, { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSiteStore } from '../../store/siteStore';
import './LandingPage.css';
import { soundFx } from '../../utils/audio';

export function LandingPage() {
  const setGameState = useGameStore((s) => s.setGameState);
  const loadGame = useGameStore((s) => s.loadGame);
  const clearSave = useGameStore((s) => s.clearSave);
  const exportSaveToFile = useGameStore((s) => s.exportSaveToFile);
  const importSaveFromFile = useGameStore((s) => s.importSaveFromFile);
  const setAuthModalOpen = useSiteStore((s) => s.setAuthModalOpen);
  
  const fileInputRef = useRef(null);

  const hasSave = !!localStorage.getItem('pc_builder_tycoon_save_v1');

  const handleNewGame = () => {
    soundFx.playClick();
    if (hasSave) {
      if (!window.confirm("Starting a new game will erase your previous save. Are you sure?")) {
        return;
      }
    }
    clearSave();
    setGameState('intro');
  };

  const handleContinue = () => {
    soundFx.playClick();
    loadGame();
  };

  const handleImportClick = () => {
    soundFx.playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      importSaveFromFile(content);
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="grid-overlay"></div>
      </div>
      
      <div className="landing-content">
        <div className="landing-logo">
          <span className="logo-icon">⚡</span>
          <h1>PC BUILDER TYCOON</h1>
          <p className="subtitle">Build. Repair. Dominate.</p>
        </div>

        <div className="landing-menu">
          <button 
            className="menu-btn btn-continue" 
            onClick={handleContinue} 
            disabled={!hasSave}
          >
            ▶ CONTINUE GAME
          </button>
          <button 
            className="menu-btn btn-new" 
            onClick={handleNewGame}
          >
            + NEW GAME
          </button>
          <button 
            className="menu-btn btn-login" 
            onClick={() => { soundFx.playClick(); setAuthModalOpen(true); }}
            style={{ marginTop: '1rem', background: '#1e293b', border: '1px solid #334155' }}
          >
            👤 CLOUD LOGIN
          </button>
        </div>
        
        {/* Advanced Save Management */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => { soundFx.playClick(); exportSaveToFile(); }}
            disabled={!hasSave}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '4px', cursor: hasSave ? 'pointer' : 'not-allowed' }}
          >
            💾 Export Save
          </button>
          <button 
            onClick={handleImportClick}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '4px', cursor: 'pointer' }}
          >
            📂 Import Save
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </div>
        
        <div className="landing-footer" style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          <p>Developed by <a href="https://www.instagram.com/ishant_padole/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>ISHANT VISHNU PADOLE</a></p>
        </div>
      </div>
    </div>
  );
}
