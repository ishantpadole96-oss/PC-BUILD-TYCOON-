import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSiteStore } from '../../store/siteStore';
import { soundFx } from '../../utils/audio';
import { OS_SHORTCUTS } from './shortcutsConfig';
import './SettingsView.css';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('security');
  const osSettings = useGameStore(s => s.osSettings) || {};
  const updateOSSettings = useGameStore(s => s.updateOSSettings);
  const shopLevel = useGameStore(s => s.shopLevel);
  const setActiveTabGlobal = useGameStore(s => s.setActiveTab);

  const tabs = [
    { id: 'security', icon: '🔒', label: 'Security & Login' },
    { id: 'personalization', icon: '🎨', label: 'Personalization' },
    { id: 'sound', icon: '🔊', label: 'Sound & Audio' },
    { id: 'system', icon: '💻', label: 'System & Performance' },
    { id: 'shortcuts', icon: '⌨️', label: 'Keyboard Shortcuts' },
    { id: 'advanced', icon: '⚙️', label: 'Developer & Advanced' },
  ];

  const handleTabClick = (id) => {
    if (osSettings.uiSounds !== false) soundFx.playHover();
    setActiveTab(id);
  };

  const handleSettingChange = (key, value) => {
    if (osSettings.uiSounds !== false) soundFx.playClick();
    updateOSSettings({ [key]: value });
  };

  const renderToggle = (label, settingKey) => (
    <div className="settings-row">
      <span>{label}</span>
      <label className="settings-toggle">
        <input 
          type="checkbox" 
          checked={!!osSettings[settingKey]} 
          onChange={(e) => handleSettingChange(settingKey, e.target.checked)} 
        />
        <span className="slider round"></span>
      </label>
    </div>
  );

  const renderSlider = (label, settingKey, min, max) => (
    <div className="settings-row">
      <span>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={osSettings[settingKey] ?? max} 
          onChange={(e) => handleSettingChange(settingKey, parseInt(e.target.value))} 
        />
        <span style={{ minWidth: '40px', textAlign: 'right', fontSize: '13px' }}>{osSettings[settingKey] ?? max}%</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <div className="settings-section">
            <h2>Security & Login</h2>
            
            <div className="settings-card">
              <h3>User Profile</h3>
              <div className="settings-row">
                <span>Display Name</span>
                <input 
                  type="text" 
                  value={osSettings.username || ''} 
                  onChange={(e) => updateOSSettings({ username: e.target.value })} 
                  placeholder="Enter username"
                  className="settings-input"
                />
              </div>
              
              <div className="settings-row" style={{ alignItems: 'flex-start' }}>
                <span style={{ marginTop: '10px' }}>Avatar</span>
                <div className="avatar-picker">
                  {['1', '2', '3', '4', '5', '6'].map(id => {
                    const avatars = { '1': '👨‍💻', '2': '👩‍💻', '3': '🤖', '4': '👻', '5': '🦁', '6': '🐱' };
                    return (
                      <button 
                        key={id}
                        className={`avatar-btn ${osSettings.avatar === id ? 'selected' : ''}`}
                        onClick={() => handleSettingChange('avatar', id)}
                        style={{ border: osSettings.avatar === id ? `2px solid ${osSettings.accentColor || '#3b82f6'}` : '2px solid transparent' }}
                      >
                        {avatars[id]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>Lock Screen</h3>
              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: '500' }}>OS Password</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>Leave blank for no password</div>
                </div>
                <input 
                  type="password" 
                  value={osSettings.osPassword || ''} 
                  onChange={(e) => updateOSSettings({ osPassword: e.target.value })} 
                  placeholder="Enter password"
                  className="settings-input"
                />
              </div>
            </div>
          </div>
        );
      
      case 'personalization':
        return (
          <div className="settings-section">
            <h2>Personalization</h2>
            
            <div className="settings-card">
              <h3>Appearance</h3>
              <div className="settings-row">
                <span>Theme</span>
                <select 
                  value={osSettings.theme || 'dark'} 
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="settings-select"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
              
              <div className="settings-row">
                <span>Accent Color</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#64748b'].map(color => (
                    <button 
                      key={color}
                      onClick={() => handleSettingChange('accentColor', color)}
                      style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: color,
                        boxShadow: osSettings.accentColor === color ? `0 0 0 2px var(--settings-bg), 0 0 0 4px ${color}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {renderSlider('Window Opacity', 'windowOpacity', 20, 100)}
            </div>

            <div className="settings-card">
              <h3>Desktop</h3>
              <div className="settings-row">
                <span>Wallpaper Fit</span>
                <select 
                  value={osSettings.wallpaperFit || 'cover'} 
                  onChange={(e) => handleSettingChange('wallpaperFit', e.target.value)}
                  className="settings-select"
                >
                  <option value="cover">Fill</option>
                  <option value="contain">Fit</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div className="settings-row">
                <span>Wallpaper Settings</span>
                <button className="settings-btn" onClick={() => setActiveTabGlobal('wallpaper')}>Open Wallpaper App</button>
              </div>
              {renderToggle('Hide Desktop Icons', 'hideDesktopIcons')}
            </div>
          </div>
        );

      case 'sound':
        return (
          <div className="settings-section">
            <h2>Sound & Audio</h2>
            
            <div className="settings-card">
              <h3>Volume</h3>
              {renderSlider('Master Volume', 'soundVolume', 0, 100)}
            </div>

            <div className="settings-card">
              <h3>System Sounds</h3>
              {renderToggle('UI Sound Effects (Hover/Click)', 'uiSounds')}
              {renderToggle('Startup Boot Chime', 'bootChime')}
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="settings-section">
            <h2>System & Performance</h2>
            
            <div className="settings-card">
              <h3>Performance</h3>
              {renderToggle('Show FPS Counter', 'showFPS')}
              {renderToggle('Reduce Motion (Disable Transitions)', 'reduceMotion')}
            </div>

            <div className="settings-card">
              <h3>Date & Time</h3>
              {renderToggle('Use 24-Hour Time', 'use24HourTime')}
            </div>

            <div className="settings-card">
              <h3>Hardware Overview</h3>
              <div className="specs-grid">
                <div>Processor</div><div>{shopLevel > 2 ? 'Titan Core i9-14900K' : 'Titan Core i5-12400F'}</div>
                <div>Memory (RAM)</div><div>{shopLevel > 2 ? '64GB DDR5-6000' : '16GB DDR4-3200'}</div>
                <div>Graphics</div><div>{shopLevel > 2 ? 'Titan RTX 4090 24GB' : 'Titan GTX 1660 Ti 6GB'}</div>
                <div>Storage</div><div>{shopLevel > 2 ? '4TB Gen5 NVMe' : '500GB SATA III SSD'}</div>
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="settings-section">
            <h2>Keyboard Shortcuts</h2>
            <div className="settings-card">
              <p style={{ opacity: 0.6, marginBottom: '15px', fontSize: '13px' }}>Global shortcuts to navigate the OS quickly. Use Shift + Key.</p>
              
              <div className="shortcuts-grid">
                {OS_SHORTCUTS.map((sc, idx) => (
                  <div key={idx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {sc.key.split('+').map((k, i) => (
                        <React.Fragment key={i}>
                          <kbd>{k}</kbd> {i < sc.key.split('+').length - 1 && '+ '}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="shortcut-desc">{sc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="settings-section">
            <h2>Developer & Advanced</h2>
            
            <div className="settings-card">
              <h3>Troubleshooting</h3>
              <p style={{ opacity: 0.6, fontSize: '13px', marginBottom: '15px' }}>Advanced tools for debugging. Use with caution.</p>
              
              <div className="settings-row">
                <span>Clear OS Cache (Icons/Windows)</span>
                <button className="settings-btn" onClick={() => {
                  localStorage.removeItem('desktop_icons_order');
                  alert('Desktop icons cache cleared. Refresh to see changes.');
                }}>Clear Cache</button>
              </div>
            </div>

            <div className="settings-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
              <div className="settings-row">
                <div>
                  <div style={{ fontWeight: '500' }}>Factory Reset OS</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>Wipes all saves and preferences.</div>
                </div>
                <button className="settings-btn danger" onClick={() => {
                  if (window.confirm('Are you absolutely sure? This will wipe your Tycoon save forever!')) {
                    localStorage.removeItem('pc_builder_tycoon_save_v1');
                    window.location.reload();
                  }
                }}>Reset Everything</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`settings-container ${osSettings.theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <div className="settings-sidebar">
        <div className="settings-sidebar-header">
          Settings
        </div>
        <div className="settings-sidebar-nav">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              style={{
                background: activeTab === tab.id ? (osSettings.accentColor || '#3b82f6') : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'inherit'
              }}
            >
              <span className="settings-nav-icon">{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-content-wrapper">
        {renderContent()}
      </div>
    </div>
  );
}
