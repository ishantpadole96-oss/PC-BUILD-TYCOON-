// Header component showing Shop Level, In-Game Day, Cash in ₹, Reputation, and Quick Actions
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { shopLevels } from '../../data/shopLevels';
import { soundFx } from '../../utils/audio';

export function Header() {
  const cash = useGameStore((s) => s.cash);
  const reputation = useGameStore((s) => s.reputation);
  const shopLevel = useGameStore((s) => s.shopLevel);
  const day = useGameStore((s) => s.day);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const resetGame = useGameStore((s) => s.resetGame);
  const notification = useGameStore((s) => s.notification);

  const currentTier = shopLevels.find((l) => l.level === shopLevel) || shopLevels[0];

  const handleSoundToggle = () => {
    soundFx.toggleMute();
  };

  const handleReset = () => {
    if (window.confirm('Start a new game? This will reset your progress and restore ₹50,000 starting cash.')) {
      resetGame();
    }
  };

  return (
    <header className="game-header">
      {/* Brand & Shop Identity */}
      <div className="header-brand">
        <div className="brand-logo">
          <span className="logo-icon">⚡</span>
          <div>
            <h1 className="brand-title">PC BUILDER TYCOON</h1>
            <div className="shop-badge">
              <span className="shop-icon">{currentTier.icon}</span>
              <span className="shop-name">{currentTier.name} (Tier {shopLevel})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Notification Toast */}
      {notification && (
        <div className={`header-toast toast-${notification.type}`}>
          <span className="toast-dot" />
          <span className="toast-text">{notification.message}</span>
        </div>
      )}

      {/* Economic & Tycoon Stats Bar */}
      <div className="header-stats">
        {/* Day & Advance Day Button */}
        <div className="stat-pill day-pill">
          <span className="stat-label">DAY</span>
          <span className="stat-value">{day}</span>
          <button
            onClick={advanceDay}
            className="btn-advance-day"
            title="Advance to next day (updates hardware market prices & orders)"
          >
            ⏩ Next Day
          </button>
        </div>

        {/* Reputation */}
        <div className="stat-pill rep-pill" title="Shop Reputation: Higher rep unlocks lucrative VIP customers">
          <span className="stat-icon">⭐</span>
          <div>
            <span className="stat-label">REPUTATION</span>
            <span className="stat-value">{reputation} PTS</span>
          </div>
        </div>

        {/* Cash Balance in ₹ (INR) */}
        <div className="stat-pill cash-pill" title="Business Capital in Indian Rupees (₹)">
          <span className="stat-icon">₹</span>
          <div>
            <span className="stat-label">CASH BALANCE</span>
            <span className="stat-value cash-highlight">
              ₹{cash.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Utility Controls */}
        <div className="header-controls">
          <button
            onClick={handleSoundToggle}
            className="btn-icon"
            title="Toggle Sound Effects"
          >
            🔊
          </button>
          <button
            onClick={handleReset}
            className="btn-icon btn-reset"
            title="New Game / Reset Progress"
          >
            🔄
          </button>
        </div>
      </div>
    </header>
  );
}
