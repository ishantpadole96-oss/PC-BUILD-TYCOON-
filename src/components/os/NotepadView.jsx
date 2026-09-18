import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function NotepadView() {
  const activeFile = useGameStore((s) => s.activeNotepadFile);
  const setActiveFile = useGameStore((s) => s.setActiveNotepadFile);
  
  const [content, setContent] = useState('');
  const fs = useGameStore((s) => s.fileSystem);
  const setFs = useGameStore((s) => s.setFileSystem);

  useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content || '');
    } else {
      setContent('');
    }
  }, [activeFile]);

  // Ensure path exists helper (re-used from FileManager for safety)
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

  const handleSave = () => {
    if (!activeFile) {
      handleSaveAs();
      return;
    }

    const newFs = JSON.parse(JSON.stringify(fs));
    const parentPath = activeFile.path.slice(0, -1);
    const fileName = activeFile.name;
    
    const dir = ensurePathExists(parentPath, newFs);
    
    // Update the file
    dir.children[fileName] = {
      type: 'file',
      size: (Math.max(1, Math.round(content.length / 1024))) + ' KB',
      content: content
    };

    setFs(newFs);
    useGameStore.getState().saveGame();
    alert(`Saved ${fileName} successfully!`);
  };

  const handleSaveAs = () => {
    const defaultName = activeFile ? activeFile.name : "notes.txt";
    const name = prompt("Enter filename to save in Documents (e.g. notes.txt):", defaultName);
    if (!name) return;
    
    const newFs = JSON.parse(JSON.stringify(fs));
    const docsPath = ['C:', 'Users', 'Guest', 'Documents'];
    const docsDir = ensurePathExists(docsPath, newFs);
    
    docsDir.children[name] = { 
      type: 'file', 
      size: (Math.max(1, Math.round(content.length / 1024))) + ' KB', 
      content 
    };
    
    setFs(newFs);
    useGameStore.getState().saveGame();
    
    // Update the active file context so subsequent 'Saves' overwrite it
    setActiveFile({ name, path: [...docsPath, name], content });
    alert(`Saved ${name} to Documents!`);
  };

  return (
    <div className="notepad-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#fff' }}>
      <div className="notepad-toolbar" style={{ display: 'flex', gap: '10px', padding: '8px 10px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', alignItems: 'center' }}>
        <button 
          onClick={handleSave} 
          style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💾 Save
        </button>
        <button 
          onClick={handleSaveAs} 
          style={{ padding: '6px 12px', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Save As...
        </button>
        <div style={{ flex: 1, padding: '6px 0', color: '#64748b', fontSize: '14px', textAlign: 'right', paddingRight: '10px' }}>
          {activeFile ? `${activeFile.name} - Notepad` : `Unsaved Document - Notepad`}
        </div>
      </div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        style={{ flex: 1, padding: '15px', border: 'none', resize: 'none', fontFamily: 'monospace', fontSize: '15px', outline: 'none', background: '#fff', color: '#000' }}
        autoFocus
        spellCheck="false"
      />
    </div>
  );
}
