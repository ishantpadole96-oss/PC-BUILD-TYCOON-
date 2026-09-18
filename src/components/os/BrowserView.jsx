import React, { useState } from 'react';
import './VirtualOS.css';

export function BrowserView() {
  const [url, setUrl] = useState('https://titanos.web/home');
  const [inputUrl, setInputUrl] = useState(url);

  const handleNavigate = (e) => {
    e.preventDefault();
    setUrl(inputUrl);
  };

  return (
    <div className="os-window-content browser-view">
      <div className="browser-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <button style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>◀</button>
        <button style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
        <button style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>↻</button>
        <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex' }}>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{ flex: 1, padding: '5px 10px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
          />
        </form>
      </div>
      <div className="browser-content" style={{ flex: 1, background: '#fff', color: '#333', padding: '20px', overflowY: 'auto' }}>
        {url.includes('titanos') ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ color: '#0f172a' }}>TitanOS Web Browser</h1>
            <p>Welcome to the World Wide Web.</p>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {setInputUrl('https://pcpartpicker.mock'); setUrl('https://pcpartpicker.mock');}}>
                PC Parts Store
              </div>
              <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {setInputUrl('https://tech-news.mock'); setUrl('https://tech-news.mock');}}>
                Tech News
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>404 - Domain Not Found</h2>
            <p>The simulated internet cannot reach {url}</p>
          </div>
        )}
      </div>
    </div>
  );
}
