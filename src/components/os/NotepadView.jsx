import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function NotepadView() {
  const [content, setContent] = useState('');
  const fs = useGameStore((s) => s.fileSystem);
  const setFs = useGameStore((s) => s.setFileSystem);

  const saveFile = () => {
    const name = prompt("Enter filename to save in Documents (e.g. notes.txt):", "notes.txt");
    if (!name) return;
    
    const newFs = JSON.parse(JSON.stringify(fs));
    const docs = newFs['C:']?.children?.['Users']?.children?.['Guest']?.children?.['Documents'];
    
    if (!docs || docs.type !== 'dir') {
      alert("Error: Documents folder not found!");
      return;
    }

    docs.children[name] = { 
      type: 'file', 
      size: (Math.max(1, Math.round(content.length / 1024))) + ' KB', 
      content 
    };
    
    setFs(newFs);
    useGameStore.getState().saveGame(); // Automatically persist
    alert("Saved to Documents successfully!");
  };

  return (
    <div className="notepad-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#fff' }}>
      <div className="notepad-toolbar" style={{ display: 'flex', gap: '10px', padding: '8px 10px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
        <button 
          onClick={saveFile} 
          style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          💾 Save to Documents
        </button>
        <div style={{ flex: 1, padding: '6px 0', color: '#64748b', fontSize: '14px' }}>
          Unsaved Document - Notepad
        </div>
      </div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        style={{ flex: 1, padding: '15px', border: 'none', resize: 'none', fontFamily: 'monospace', fontSize: '15px', outline: 'none', background: '#fff', color: '#000' }}
        autoFocus
      />
    </div>
  );
}
