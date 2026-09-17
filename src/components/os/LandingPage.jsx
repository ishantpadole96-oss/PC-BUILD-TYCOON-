import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './LandingPage.css';
import { soundFx } from '../../utils/audio';

export function LandingPage() {
  const setGameState = useGameStore((s) => s.setGameState);
  const loadGame = useGameStore((s) => s.loadGame);
  const clearSave = useGameStore((s) => s.clearSave);

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
        </div>
      </div>
    </div>
  );
}
