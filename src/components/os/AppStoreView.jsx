import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { OS_APPS, CORE_APPS } from './appsConfig';
import { soundFx } from '../../utils/audio';

export function AppStoreView() {
  const installedApps = useGameStore(s => s.installedApps) || [];
  const installApp = useGameStore(s => s.installApp);
  const uninstallApp = useGameStore(s => s.uninstallApp);

  const handleInstall = (appId) => {
    installApp(appId);
  };

  const handleUninstall = (appId) => {
    if (!CORE_APPS.includes(appId)) {
      soundFx.playClick();
      uninstallApp(appId);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#09090b',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: '#111116',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>🛒</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Titan Store</h1>
            <div style={{ color: '#888', fontSize: '14px' }}>Apps, Games & Utilities</div>
          </div>
        </div>
      </div>

      {/* App List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>All Apps</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {OS_APPS.map(app => {
            const isInstalled = installedApps.includes(app.id);
            const isCore = CORE_APPS.includes(app.id);

            return (
              <div key={app.id} style={{
                background: '#18181f',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }
              }}>
                <div style={{
                  fontSize: '40px',
                  width: '60px',
                  height: '60px',
                  background: '#222',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {app.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{app.label}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>
                    {app.desc || 'A standard Titan OS application.'}
                  </p>
                  
                  {isInstalled ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        disabled
                        style={{
                          background: 'transparent',
                          color: '#4caf50',
                          border: '1px solid #4caf50',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'default'
                        }}
                      >
                        Installed
                      </button>
                      
                      {!isCore && (
                        <button 
                          onClick={() => handleUninstall(app.id)}
                          style={{
                            background: 'transparent',
                            color: '#ff4444',
                            border: '1px solid #ff4444',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.1)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          Uninstall
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleInstall(app.id)}
                      style={{
                        background: '#0078d7',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#005a9e'}
                      onMouseLeave={(e) => e.target.style.background = '#0078d7'}
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
