import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import './VirtualOS.css';

export function FileManagerView() {
  const fs = useGameStore((s) => s.fileSystem);
  const setFs = useGameStore((s) => s.setFileSystem);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const setActiveNotepadFile = useGameStore((s) => s.setActiveNotepadFile);

  const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);
  
  // Inline Creation State
  const [isCreating, setIsCreating] = useState(false); // 'file' | 'dir' | false
  const [createName, setCreateName] = useState('');
  const createInputRef = useRef(null);

  useEffect(() => {
    if (isCreating && createInputRef.current) {
      createInputRef.current.focus();
      createInputRef.current.select();
    }
  }, [isCreating]);

  const getCurrentDir = () => {
    let dir = fs;
    for (const part of currentPath) {
      if (dir[part] && dir[part].children) dir = dir[part].children;
      else if (dir.children && dir.children[part]) dir = dir.children[part].children;
      else return {};
    }
    return dir;
  };

  const currentDirFiles = getCurrentDir().children || {};

  const handleNavigateUp = () => {
    if (currentPath.length > 1) setCurrentPath(currentPath.slice(0, -1));
  };

  const handleQuickAccess = (pathArray) => {
    setCurrentPath(pathArray);
  };

  const ensurePathExists = (targetPath, newFs) => {
    let current = newFs;
    for (const part of targetPath) {
      if (current.children) {
        if (!current.children[part]) current.children[part] = { type: 'dir', children: {} };
        current = current.children[part];
      } else {
        if (!current[part]) current[part] = { type: 'dir', children: {} };
        current = current[part];
      }
    }
    return current;
  };

  const confirmCreate = () => {
    if (!createName.trim()) {
      setIsCreating(false);
      setCreateName('');
      return;
    }
    
    let finalName = createName.trim();
    if (isCreating === 'file' && !finalName.includes('.')) {
      finalName += '.txt'; // Default extension
    }

    if (currentDirFiles[finalName]) {
      alert("File or folder already exists!");
      setIsCreating(false);
      return;
    }
    
    const newFs = JSON.parse(JSON.stringify(fs));
    const dir = ensurePathExists(currentPath, newFs);
    
    if (!dir.children) dir.children = {};
    if (isCreating === 'file') {
      dir.children[finalName] = { type: 'file', size: '1 KB', content: '' };
    } else {
      dir.children[finalName] = { type: 'dir', children: {} };
    }
    
    setFs(newFs);
    useGameStore.getState().saveGame();
    setIsCreating(false);
    setCreateName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirmCreate();
    if (e.key === 'Escape') {
      setIsCreating(false);
      setCreateName('');
    }
  };

  const handleOpenFile = (name, data) => {
    if (data.type === 'dir') {
      setCurrentPath([...currentPath, name]);
    } else {
      if (name.endsWith('.txt') || name.endsWith('.ini')) {
        setActiveNotepadFile({ name, path: [...currentPath, name], content: data.content || '' });
        setActiveTab('notepad');
      } else if (name.endsWith('.png') || name.endsWith('.jpg')) {
        alert("Cannot open image files. Use Wallpaper Settings to apply them!");
      } else {
        alert(`Cannot open ${name}. No associated program.`);
      }
    }
  };

  // Calculate used space roughly
  const calculateSpace = (obj) => {
    let bytes = 0;
    for (const key in obj) {
      const item = obj[key];
      if (item.type === 'dir' && item.children) {
        bytes += calculateSpace(item.children);
      } else if (item.type === 'file') {
        if (item.size && item.size.includes('GB')) bytes += parseFloat(item.size) * 1024 * 1024 * 1024;
        else if (item.size && item.size.includes('MB')) bytes += parseFloat(item.size) * 1024 * 1024;
        else if (item.size && item.size.includes('KB')) bytes += parseFloat(item.size) * 1024;
      }
    }
    return bytes;
  };
  
  const usedSpaceMB = (calculateSpace(fs) / (1024 * 1024)).toFixed(1);

  return (
    <div className="file-manager-view" style={{ display: 'flex', width: '100%', height: '100%', background: '#fff', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Sidebar Navigation (macOS Sidebar Style) */}
      <div style={{ 
        width: '220px', 
        background: 'rgba(235, 235, 240, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid #d1d1d6', 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto' 
      }}>
        <div style={{ padding: '20px 15px 10px', fontWeight: '600', color: '#8e8e93', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Favorites</div>
        
        <div onClick={() => handleQuickAccess(['C:'])} style={{ padding: '8px 15px', margin: '2px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: currentPath.join() === 'C:' ? '#007aff' : 'transparent', color: currentPath.join() === 'C:' ? '#fff' : '#000' }}>
          <span>💻</span> <span style={{ fontSize: '13px', fontWeight: currentPath.join() === 'C:' ? '500' : 'normal' }}>This PC</span>
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Documents'])} style={{ padding: '8px 15px', margin: '2px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: currentPath.join() === 'C:,Users,Guest,Documents' ? '#007aff' : 'transparent', color: currentPath.join() === 'C:,Users,Guest,Documents' ? '#fff' : '#000' }}>
          <span>📄</span> <span style={{ fontSize: '13px', fontWeight: currentPath.join() === 'C:,Users,Guest,Documents' ? '500' : 'normal' }}>Documents</span>
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Downloads'])} style={{ padding: '8px 15px', margin: '2px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: currentPath.join() === 'C:,Users,Guest,Downloads' ? '#007aff' : 'transparent', color: currentPath.join() === 'C:,Users,Guest,Downloads' ? '#fff' : '#000' }}>
          <span>⬇️</span> <span style={{ fontSize: '13px', fontWeight: currentPath.join() === 'C:,Users,Guest,Downloads' ? '500' : 'normal' }}>Downloads</span>
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Pictures'])} style={{ padding: '8px 15px', margin: '2px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: currentPath.join() === 'C:,Users,Guest,Pictures' ? '#007aff' : 'transparent', color: currentPath.join() === 'C:,Users,Guest,Pictures' ? '#fff' : '#000' }}>
          <span>🖼️</span> <span style={{ fontSize: '13px', fontWeight: currentPath.join() === 'C:,Users,Guest,Pictures' ? '500' : 'normal' }}>Pictures</span>
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Games'])} style={{ padding: '8px 15px', margin: '2px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: currentPath.join() === 'C:,Users,Guest,Games' ? '#007aff' : 'transparent', color: currentPath.join() === 'C:,Users,Guest,Games' ? '#fff' : '#000' }}>
          <span>🎮</span> <span style={{ fontSize: '13px', fontWeight: currentPath.join() === 'C:,Users,Guest,Games' ? '500' : 'normal' }}>Games</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Toolbar (macOS Style) */}
        <div className="file-toolbar" style={{ display: 'flex', gap: '15px', padding: '15px 20px', background: '#fff', borderBottom: '1px solid #e5e5ea', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={handleNavigateUp} 
              disabled={currentPath.length <= 1} 
              style={{ 
                padding: '6px 12px', 
                background: currentPath.length <= 1 ? '#f2f2f7' : '#fff', 
                color: currentPath.length <= 1 ? '#c7c7cc' : '#000',
                border: '1px solid #d1d1d6', 
                borderRadius: '6px', 
                cursor: currentPath.length <= 1 ? 'default' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '16px'
              }}
            >
              <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>↰</span>
            </button>
          </div>
          
          {/* Breadcrumb Path */}
          <div style={{ 
            flex: 1, 
            padding: '6px 15px', 
            background: '#f2f2f7', 
            borderRadius: '6px', 
            color: '#333', 
            fontSize: '13px',
            display: 'flex', 
            alignItems: 'center',
            fontWeight: '500'
          }}>
            {currentPath.join(' > ')}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => { setIsCreating('dir'); setCreateName('Untitled Folder'); }} 
              style={{ padding: '6px 12px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              + Folder
            </button>
            <button 
              onClick={() => { setIsCreating('file'); setCreateName('untitled.txt'); }} 
              style={{ padding: '6px 12px', background: '#fff', border: '1px solid #d1d1d6', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              + File
            </button>
          </div>
        </div>
        
        {/* File Grid/List */}
        <div className="file-list" style={{ flex: 1, background: '#fff', color: '#000', padding: '20px', overflowY: 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px' }}>
            {Object.entries(currentDirFiles).map(([name, data]) => (
              <div 
                key={name}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  padding: '10px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f2f2f7'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onDoubleClick={() => handleOpenFile(name, data)}
              >
                <div style={{ fontSize: '48px', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {data.type === 'dir' ? '📁' : (name.endsWith('.png') || name.endsWith('.jpg') ? '🖼️' : '📄')}
                </div>
                <div style={{ fontSize: '12px', textAlign: 'center', wordBreak: 'break-word', color: '#333' }}>
                  {name}
                </div>
              </div>
            ))}

            {isCreating && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                padding: '10px', 
                borderRadius: '6px',
                background: '#e3f2fd'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                  {isCreating === 'dir' ? '📁' : '📄'}
                </div>
                <input 
                  ref={createInputRef}
                  type="text" 
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={confirmCreate}
                  style={{ width: '100%', fontSize: '12px', textAlign: 'center', padding: '2px', border: '1px solid #007aff', borderRadius: '3px', outline: 'none' }}
                />
              </div>
            )}
          </div>

          {Object.keys(currentDirFiles).length === 0 && !isCreating && (
            <div style={{ padding: '60px', color: '#8e8e93', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}>📂</div>
              <div style={{ fontSize: '14px' }}>This folder is empty</div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{ padding: '8px 15px', background: '#fff', borderTop: '1px solid #e5e5ea', fontSize: '11px', color: '#8e8e93', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <span>{Object.keys(currentDirFiles).length} item{Object.keys(currentDirFiles).length !== 1 ? 's' : ''}</span>
          <span>{usedSpaceMB} MB Used / 256.0 GB Total</span>
        </div>
      </div>
    </div>
  );
}
