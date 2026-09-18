import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './VirtualOS.css';

export function FileManagerView() {
  const fs = useGameStore((s) => s.fileSystem);
  const setFs = useGameStore((s) => s.setFileSystem);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const setActiveNotepadFile = useGameStore((s) => s.setActiveNotepadFile);

  const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);

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

  const handleCreateFile = () => {
    const name = prompt("Enter new file name (e.g. notes.txt):", "newfile.txt");
    if (!name) return;
    if (currentDirFiles[name]) {
      alert("File or folder already exists!");
      return;
    }
    
    const newFs = JSON.parse(JSON.stringify(fs));
    const dir = ensurePathExists(currentPath, newFs);
    
    if (!dir.children) dir.children = {};
    dir.children[name] = { type: 'file', size: '1 KB', content: '' };
    setFs(newFs);
    useGameStore.getState().saveGame();
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter new folder name:");
    if (!name) return;
    if (currentDirFiles[name]) {
      alert("File or folder already exists!");
      return;
    }
    
    const newFs = JSON.parse(JSON.stringify(fs));
    const dir = ensurePathExists(currentPath, newFs);
    
    if (!dir.children) dir.children = {};
    dir.children[name] = { type: 'dir', children: {} };
    setFs(newFs);
    useGameStore.getState().saveGame();
  };

  const handleOpenFile = (name, data) => {
    if (data.type === 'dir') {
      setCurrentPath([...currentPath, name]);
    } else {
      if (name.endsWith('.txt') || name.endsWith('.ini')) {
        // Dispatch to Notepad app
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
    <div className="file-manager-view" style={{ display: 'flex', width: '100%', height: '100%', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '200px', background: '#f1f5f9', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '15px 10px', fontWeight: 'bold', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Quick Access</div>
        
        <div onClick={() => handleQuickAccess(['C:'])} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: currentPath.join() === 'C:' ? '#e2e8f0' : 'transparent' }}>
          <span>💻</span> This PC
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Documents'])} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: currentPath.join() === 'C:,Users,Guest,Documents' ? '#e2e8f0' : 'transparent' }}>
          <span>📄</span> Documents
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Downloads'])} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: currentPath.join() === 'C:,Users,Guest,Downloads' ? '#e2e8f0' : 'transparent' }}>
          <span>⬇️</span> Downloads
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Pictures'])} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: currentPath.join() === 'C:,Users,Guest,Pictures' ? '#e2e8f0' : 'transparent' }}>
          <span>🖼️</span> Pictures
        </div>
        <div onClick={() => handleQuickAccess(['C:', 'Users', 'Guest', 'Games'])} style={{ padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: currentPath.join() === 'C:,Users,Guest,Games' ? '#e2e8f0' : 'transparent' }}>
          <span>🎮</span> Games
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div className="file-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
          <button onClick={handleNavigateUp} disabled={currentPath.length <= 1} style={{ padding: '5px 10px', cursor: currentPath.length <= 1 ? 'default' : 'pointer' }}>⬆️ Up</button>
          
          {/* Breadcrumb Path */}
          <div style={{ flex: 1, padding: '5px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#334155', display: 'flex', alignItems: 'center' }}>
            {currentPath.join(' \\ ')}
          </div>
          
          <button onClick={handleCreateFolder} style={{ padding: '5px 10px', background: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Folder</button>
          <button onClick={handleCreateFile} style={{ padding: '5px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Text File</button>
        </div>
        
        {/* File Grid/List */}
        <div className="file-list" style={{ flex: 1, background: 'white', color: '#333', padding: '10px', overflowY: 'auto' }}>
          {Object.entries(currentDirFiles).map(([name, data]) => (
            <div 
              key={name}
              style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
              onClick={() => handleOpenFile(name, data)}
            >
              <span style={{ fontSize: '24px', marginRight: '15px' }}>
                {data.type === 'dir' ? '📁' : '📄'}
              </span>
              <span style={{ flex: 1, fontWeight: data.type === 'dir' ? 'bold' : 'normal' }}>{name}</span>
              {data.type === 'file' && <span style={{ color: '#64748b', fontSize: '12px' }}>{data.size}</span>}
            </div>
          ))}
          {Object.keys(currentDirFiles).length === 0 && (
            <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📂</div>
              This folder is empty.
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div style={{ padding: '8px 10px', background: '#e2e8f0', borderTop: '1px solid #cbd5e1', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
          <span>{Object.keys(currentDirFiles).length} item(s)</span>
          <span>Disk Space: {usedSpaceMB} MB Used / 256.0 GB Total</span>
        </div>
      </div>
    </div>
  );
}
