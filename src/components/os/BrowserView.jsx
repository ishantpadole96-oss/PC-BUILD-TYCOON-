import React, { useState } from 'react';
import './VirtualOS.css';

export function BrowserView() {
  const [history, setHistory] = useState(['https://titanos.web/home']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState('https://titanos.web/home');
  const [iframeKey, setIframeKey] = useState(0);

  const url = history[currentIndex];

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
    
    // If navigating to a new URL, push it and truncate future history
    if (finalUrl !== url) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(finalUrl);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
    setInputUrl(finalUrl);
  };

  const navigateTo = (targetUrl) => {
    let finalUrl = targetUrl;
    if (finalUrl.toLowerCase().includes('google.com')) {
      finalUrl = 'https://www.google.com/webhp?igu=1';
    }
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setInputUrl(finalUrl);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setInputUrl(history[currentIndex - 1]);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputUrl(history[currentIndex + 1]);
    }
  };

  const reload = () => setIframeKey(k => k + 1);

  const isMock = url.includes('titanos.web') || url.endsWith('.mock');

  return (
    <div className="browser-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#09090b', color: '#fff' }}>
      {/* Browser Toolbar - GX Style */}
      <div className="browser-toolbar" style={{ display: 'flex', gap: '10px', padding: '12px 16px', background: '#111116', borderBottom: '1px solid #fa003f', alignItems: 'center' }}>
        <button 
          onClick={goBack} 
          disabled={currentIndex === 0}
          style={{ background: 'transparent', border: 'none', color: currentIndex === 0 ? '#555' : '#fa003f', fontSize: '18px', cursor: currentIndex === 0 ? 'default' : 'pointer' }}
        >
          ◀
        </button>
        <button 
          onClick={goForward} 
          disabled={currentIndex === history.length - 1}
          style={{ background: 'transparent', border: 'none', color: currentIndex === history.length - 1 ? '#555' : '#fa003f', fontSize: '18px', cursor: currentIndex === history.length - 1 ? 'default' : 'pointer' }}
        >
          ▶
        </button>
        <button onClick={reload} style={{ background: 'transparent', border: 'none', color: '#fa003f', fontSize: '18px', cursor: 'pointer' }}>↻</button>
        
        <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex', marginLeft: '10px' }}>
          <div style={{ flex: 1, display: 'flex', background: '#18181f', borderRadius: '20px', border: '1px solid #333', overflow: 'hidden' }}>
            <span style={{ padding: '8px 12px', background: '#18181f', color: '#fa003f', fontWeight: 'bold' }}>GX</span>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', border: 'none', background: 'transparent', color: 'white', outline: 'none' }}
            />
          </div>
        </form>
      </div>
      
      <div className="browser-content" style={{ flex: 1, background: '#09090b', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {isMock ? (
          url.includes('titanos') ? (
            // Opera GX Style Landing Page
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', background: 'radial-gradient(circle at top, #1a000d 0%, #09090b 80%)' }}>
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: '900', letterSpacing: '2px', margin: 0, textShadow: '0 0 20px #fa003f' }}>
                  <span style={{ color: '#fa003f' }}>TITAN</span> GX
                </h1>
                <p style={{ color: '#888', marginTop: '10px' }}>The Browser for Gamers</p>
              </div>
              
              <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
                {/* GX Corner Widget */}
                <div style={{ background: '#111116', border: '1px solid #333', borderRadius: '12px', padding: '20px', width: '300px', borderTop: '3px solid #fa003f' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fa003f' }}>🎮</span> GX Corner
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222' }} onClick={() => navigateTo('https://pcpartpicker.mock')}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>PC Parts Store</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Shop the latest hardware</div>
                    </div>
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222' }} onClick={() => navigateTo('https://tech-news.mock')}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Tech News Hub</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Live market intelligence</div>
                    </div>
                  </div>
                </div>

                {/* Search Widget */}
                <div style={{ background: '#111116', border: '1px solid #333', borderRadius: '12px', padding: '20px', width: '300px', borderTop: '3px solid #00f0ff' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#00f0ff' }}>🔍</span> Quick Search
                  </h3>
                  <div 
                    style={{ background: '#18181f', padding: '20px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', textAlign: 'center', transition: 'all 0.2s' }} 
                    onClick={() => navigateTo('https://www.google.com')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f0ff'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>G</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Google Search</div>
                  </div>
                </div>

                {/* Free Games Widget */}
                <div style={{ background: '#111116', border: '1px solid #333', borderRadius: '12px', padding: '20px', width: '300px', borderTop: '3px solid #a200ff' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#a200ff' }}>🎁</span> Free Games
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', color: '#ccc' }}>Cyber Strike 2077</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', color: '#ccc' }}>Valorant</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                  </div>
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
            style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: '#fff' }}
          />
        )}
      </div>
    </div>
  );
}
