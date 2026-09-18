import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './VirtualOS.css';

export function FileManagerView() {
  const fs = useGameStore((s) => s.fileSystem);
  const setFs = useGameStore((s) => s.setFileSystem);

  const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);
  const [editingFile, setEditingFile] = useState(null); // { name, path, content }

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

  const handleCreateFile = () => {
    const name = prompt("Enter new file name (e.g. notes.txt):", "newfile.txt");
    if (!name) return;
    if (currentDirFiles[name]) {
      alert("File or folder already exists!");
      return;
    }
    
    // Deep clone fs to update
    const newFs = JSON.parse(JSON.stringify(fs));
    let dir = newFs;
    for (const part of currentPath) {
      if (dir[part] && dir[part].children) dir = dir[part].children;
      else if (dir.children && dir.children[part]) dir = dir.children[part].children;
    }
    
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
    
    // Deep clone fs to update
    const newFs = JSON.parse(JSON.stringify(fs));
    let dir = newFs;
    for (const part of currentPath) {
      if (dir[part] && dir[part].children) dir = dir[part].children;
      else if (dir.children && dir.children[part]) dir = dir.children[part].children;
    }
    
    if (!dir.children) dir.children = {};
    dir.children[name] = { type: 'dir', children: {} };
    setFs(newFs);
    useGameStore.getState().saveGame();
  };

  const handleOpenFile = (name, data) => {
    if (data.type === 'dir') {
      setCurrentPath([...currentPath, name]);
    } else {
      setEditingFile({ name, path: [...currentPath, name], content: data.content || '' });
    }
  };

  const saveFile = () => {
    const newFs = JSON.parse(JSON.stringify(fs));
    let dir = newFs;
    for (const part of currentPath) {
      if (dir[part] && dir[part].children) dir = dir[part].children;
      else if (dir.children && dir.children[part]) dir = dir.children[part].children;
    }
    
    if (dir.children && dir.children[editingFile.name]) {
      dir.children[editingFile.name].content = editingFile.content;
      dir.children[editingFile.name].size = (Math.max(1, Math.round(editingFile.content.length / 1024))) + ' KB';
    }
    
    setFs(newFs);
    useGameStore.getState().saveGame(); // Automatically persist
    setEditingFile(null);
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

  if (editingFile) {
    return (
      <div className="file-manager-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <div className="file-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
          <button onClick={() => setEditingFile(null)} style={{ padding: '5px 10px', cursor: 'pointer' }}>◀ Cancel</button>
          <div style={{ flex: 1, padding: '5px 10px', fontWeight: 'bold', color: '#000' }}>Editing: {editingFile.name}</div>
          <button onClick={saveFile} style={{ padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>💾 Save</button>
        </div>
        <textarea 
          value={editingFile.content}
          onChange={(e) => setEditingFile({...editingFile, content: e.target.value})}
          style={{ flex: 1, padding: '15px', border: 'none', resize: 'none', fontFamily: 'monospace', fontSize: '14px', outline: 'none' }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="file-manager-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#f8fafc' }}>
      <div className="file-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
        <button onClick={handleNavigateUp} disabled={currentPath.length <= 1} style={{ padding: '5px 10px', cursor: currentPath.length <= 1 ? 'default' : 'pointer' }}>⬆️ Up</button>
        <div style={{ flex: 1, padding: '5px 10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155' }}>
          {currentPath.join(' \\ ')}
        </div>
        <button onClick={handleCreateFolder} style={{ padding: '5px 10px', background: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ New Folder</button>
        <button onClick={handleCreateFile} style={{ padding: '5px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ New File</button>
      </div>
      
      <div className="file-list" style={{ flex: 1, background: 'white', color: '#333', padding: '10px', overflowY: 'auto' }}>
        {Object.entries(currentDirFiles).map(([name, data]) => (
          <div 
            key={name}
            style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
            onClick={() => handleOpenFile(name, data)}
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

      <div style={{ padding: '10px', background: '#e2e8f0', borderTop: '1px solid #cbd5e1', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
        <span>{Object.keys(currentDirFiles).length} item(s)</span>
        <span>Disk Space: {usedSpaceMB} MB Used / 256.0 GB Total</span>
      </div>
    </div>
  );
}
