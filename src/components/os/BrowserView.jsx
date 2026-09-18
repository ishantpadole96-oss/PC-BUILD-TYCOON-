import React, { useState } from 'react';
import './VirtualOS.css';

export function BrowserView() {
  const [url, setUrl] = useState('https://titanos.web/home');
  const [inputUrl, setInputUrl] = useState(url);
  const [iframeKey, setIframeKey] = useState(0);

  const handleNavigate = (e) => {
    e.preventDefault();
    let finalUrl = inputUrl;
    
    // Auto-correct common google inputs to the iframe-friendly version
    if (finalUrl.toLowerCase().includes('google.com')) {
      finalUrl = 'https://www.google.com/webhp?igu=1';
    }
    else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.includes('titanos.web') && !finalUrl.endsWith('.mock')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    setUrl(finalUrl);
    setInputUrl(finalUrl);
  };

  const reload = () => setIframeKey(k => k + 1);

  const isMock = url.includes('titanos.web') || url.endsWith('.mock');

  return (
    <div className="browser-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div className="browser-toolbar" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <button style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>◀</button>
        <button style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
        <button onClick={reload} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>↻</button>
        <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex' }}>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{ flex: 1, padding: '5px 10px', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
          />
        </form>
      </div>
      <div className="browser-content" style={{ flex: 1, background: '#fff', color: '#333', overflow: 'hidden', display: 'flex' }}>
        {isMock ? (
          url.includes('titanos') ? (
            <div style={{ flex: 1, textAlign: 'center', marginTop: '50px' }}>
              <h1 style={{ color: '#0f172a' }}>TitanOS Web Browser</h1>
              <p>Welcome to the World Wide Web.</p>
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {setInputUrl('https://www.google.com'); setUrl('https://www.google.com/webhp?igu=1');}}>
                  Google Search
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {setInputUrl('https://pcpartpicker.mock'); setUrl('https://pcpartpicker.mock');}}>
                  PC Parts Store
                </div>
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {setInputUrl('https://tech-news.mock'); setUrl('https://tech-news.mock');}}>
                  Tech News
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, textAlign: 'center', marginTop: '50px' }}>
              <h2>404 - Domain Not Found</h2>
              <p>The simulated internet cannot reach {url}</p>
            </div>
          )
        ) : (
          <iframe 
            key={iframeKey}
            src={url} 
            title="web-content"
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </div>
    </div>
  );
}
