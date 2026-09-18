// Game HUD - Top status bar showing Cash, Reputation, Day, Shop Level
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSiteStore } from '../../store/siteStore';
import { shopLevels } from '../../data/shopLevels';
import { soundFx } from '../../utils/audio';
import './GameHUD.css';

export function GameHUD() {
  const cash = useGameStore((s) => s.cash);
  const reputation = useGameStore((s) => s.reputation);
  const day = useGameStore((s) => s.day);
  const shopLevel = useGameStore((s) => s.shopLevel);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const clearSave = useGameStore((s) => s.clearSave);
  const market = useGameStore((s) => s.market);
  const notification = useGameStore((s) => s.notification);
  const setAuthModalOpen = useSiteStore((s) => s.setAuthModalOpen);
  const user = useSiteStore((s) => s.user);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);

  const currentTier = shopLevels.find((l) => l.level === shopLevel) || shopLevels[0];

  const handleToggleMute = () => {
    const newMuted = soundFx.toggleMute();
    setIsMuted(newMuted);
  };

  return (
    <>
      <div className="game-hud">
        {/* Brand */}
        <div className="hud-brand">
          <span className="hud-logo">⚡</span>
          <div className="hud-brand-text">
            <span className="hud-title">PC Builder Tycoon</span>
            <span className="hud-subtitle">Build. Repair. Dominate.</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hud-stats">
          <div className="hud-stat stat-cash">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-label">CASH</span>
              <span className="stat-value">₹{cash.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="hud-stat stat-rep">
            <span className="stat-icon">⭐</span>
            <div className="stat-info">
              <span className="stat-label">REPUTATION</span>
              <span className="stat-value">{reputation}</span>
            </div>
          </div>

          <div className="hud-stat stat-day">
            <span className="stat-icon">📅</span>
            <div className="stat-info">
              <span className="stat-label">DAY</span>
              <span className="stat-value">{day}</span>
            </div>
          </div>

          <div className="hud-stat stat-shop">
            <span className="stat-icon">{currentTier.icon}</span>
            <div className="stat-info">
              <span className="stat-label">SHOP LEVEL</span>
              <span className="stat-value">{currentTier.name}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="hud-controls">
          <button
            className={`hud-btn hud-btn-mute ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? '🔇' : '🔊'} {isMuted ? 'Muted' : 'Sound'}
          </button>
          <button className="hud-btn hud-btn-day" onClick={advanceDay} title="Advance to next business day">
            ☀️ Next Day
          </button>
          <button className="hud-btn hud-btn-reset" onClick={clearSave} title="Reset game to Day 1">
            🔄 Reset
          </button>
          <button className="hud-btn hud-btn-signin" onClick={() => { setAuthModalOpen(true); useGameStore.getState().saveGame(); }} title="Sign in to cloud save your progress">
            {user ? '✅ Cloud Saved' : '👤 Sign In to Save'}
          </button>
        </div>
      </div>

      {/* Market Event Ticker */}
      {market.activeEvent && (
        <div className="hud-event-ticker">
          <span className="event-badge">📢 MARKET EVENT</span>
          <span className="event-title">{market.activeEvent.title}</span>
          <span className="event-desc">{market.activeEvent.description}</span>
          <span className="event-timer">{market.eventDaysRemaining} days left</span>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`game-toast toast-${notification.type}`} key={notification.id}>
          <span className="toast-icon">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-msg">{notification.message}</span>
        </div>
      )}
    </>
  );
}

