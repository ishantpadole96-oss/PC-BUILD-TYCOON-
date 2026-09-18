import React, { useState } from 'react';
import './VirtualOS.css';

const MOCK_FILESYSTEM = {
  'C:': {
    type: 'dir',
    children: {
      'TitanOS': {
        type: 'dir',
        children: {
          'System32': { type: 'dir', children: {} },
          'boot.ini': { type: 'file', size: '12 KB' },
        }
      },
      'Users': {
        type: 'dir',
        children: {
          'Guest': {
            type: 'dir',
            children: {
              'Documents': { type: 'dir', children: { 'passwords.txt': { type: 'file', size: '2 KB' } } },
              'Downloads': { type: 'dir', children: { 'installer.exe': { type: 'file', size: '45 MB' } } },
              'Pictures': { type: 'dir', children: { 'wallpaper.png': { type: 'file', size: '2.5 MB' } } },
            }
          }
        }
      }
    }
  }
};

export function FileManagerView() {
  const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);

  const getCurrentDir = () => {
    let dir = MOCK_FILESYSTEM;
    for (const part of currentPath) {
      if (dir[part] && dir[part].children) {
        dir = dir[part].children;
      } else if (dir.children && dir.children[part]) {
        dir = dir.children[part].children;
      }
    }
    return dir;
  };

  const handleNavigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const currentDirFiles = getCurrentDir().children || {};

  return (
    <div className="file-manager-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div className="file-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
        <button onClick={handleNavigateUp} disabled={currentPath.length <= 1} style={{ padding: '5px 10px', cursor: currentPath.length <= 1 ? 'default' : 'pointer' }}>⬆️ Up</button>
        <div style={{ flex: 1, padding: '5px 10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155' }}>
          {currentPath.join(' \\ ')}
        </div>
      </div>
      
      <div className="file-list" style={{ flex: 1, background: 'white', color: '#333', padding: '10px', overflowY: 'auto' }}>
        {Object.entries(currentDirFiles).map(([name, data]) => (
          <div 
            key={name}
            style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
            onClick={() => {
              if (data.type === 'dir') {
                setCurrentPath([...currentPath, name]);
              }
            }}
          >
            <span style={{ fontSize: '20px', marginRight: '10px' }}>
              {data.type === 'dir' ? '📁' : '📄'}
            </span>
            <span style={{ flex: 1 }}>{name}</span>
            {data.type === 'file' && <span style={{ color: '#64748b', fontSize: '12px' }}>{data.size}</span>}
          </div>
        ))}
        {Object.keys(currentDirFiles).length === 0 && (
          <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>This folder is empty.</div>
        )}
      </div>
    </div>
  );
}
