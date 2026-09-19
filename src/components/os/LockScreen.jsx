import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundFx } from '../../utils/audio';
import './LockScreen.css';

export function LockScreen() {
  const osSettings = useGameStore(s => s.osSettings);
  const setIsLocked = useGameStore(s => s.setIsLocked);
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  // Format current date and time for the lock screen like macOS
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: !osSettings.use24HourTime 
  });
  
  const dateString = time.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!osSettings.osPassword) {
      soundFx.playClick();
      if (osSettings.bootChime) soundFx.playSuccess(); // Placeholder for boot chime
      setIsLocked(false);
      return;
    }

    if (password === osSettings.osPassword) {
      soundFx.playClick();
      if (osSettings.bootChime) soundFx.playSuccess();
      setIsLocked(false);
    } else {
      setError(true);
      soundFx.playError();
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const getAvatarIcon = (avatarId) => {
    const avatars = {
      '1': '👨‍💻',
      '2': '👩‍💻',
      '3': '🤖',
      '4': '👻',
      '5': '🦁',
      '6': '🐱',
    };
    return avatars[avatarId] || '👨‍💻';
  };

  return (
    <div className="lockscreen-container">
      <div className="lockscreen-blur-layer"></div>
      
      <div className="lockscreen-top-bar">
        <span>{timeString}</span>
      </div>

      <div className="lockscreen-content">
        <div className="lockscreen-datetime">
          <div className="lockscreen-time">{timeString}</div>
          <div className="lockscreen-date">{dateString}</div>
        </div>

        <div className="lockscreen-user-section">
          <div className="lockscreen-avatar">
            {getAvatarIcon(osSettings.avatar)}
          </div>
          <h2 className="lockscreen-username">{osSettings.username || 'User'}</h2>
          
          <form onSubmit={handleLogin} className="lockscreen-form">
            {osSettings.osPassword ? (
              <div className={`password-input-wrapper ${error ? 'shake' : ''}`}>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button type="submit">→</button>
              </div>
            ) : (
              <p className="no-password-text">Click to login</p>
            )}
            {!osSettings.osPassword && (
              <button type="submit" className="login-button">Login</button>
            )}
          </form>
          
          {error && <div className="password-error">Incorrect password</div>}
        </div>
      </div>
    </div>
  );
}
