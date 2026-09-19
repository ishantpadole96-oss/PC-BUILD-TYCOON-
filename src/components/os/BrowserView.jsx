import React, { useState, useEffect } from 'react';
import './VirtualOS.css';

export function BrowserView({ initialSearchQuery, onSearchConsumed }) {
  const [history, setHistory] = useState(['https://titanos.web/home']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState('https://titanos.web/home');
  const [iframeKey, setIframeKey] = useState(0);

  const url = history[currentIndex];

  // When opened with a search query, navigate to Google search
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim().length > 0) {
      const googleUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(initialSearchQuery)}`;
      const newHistory = [...history, googleUrl];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setInputUrl(googleUrl);
      setIframeKey(k => k + 1);
      if (onSearchConsumed) onSearchConsumed();
    }
  }, [initialSearchQuery]);

  const handleNavigate = (e) => {
    e.preventDefault();
    let finalUrl = inputUrl;
    
    // Auto-correct common google inputs to the iframe-friendly version
    if (finalUrl.toLowerCase().includes('google.com')) {
      finalUrl = 'https://www.google.com/webhp?igu=1';
    }
    // Check if it's a search query (no dot, or contains spaces)
    else if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
      finalUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(finalUrl)}`;
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
            <span 
              onClick={() => navigateTo('https://titanos.web/home')}
              style={{ padding: '8px 12px', background: '#18181f', color: '#fa003f', fontWeight: 'bold', cursor: 'pointer' }}
              title="Go to GX Home"
            >
              GX
            </span>
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
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }} 
                      onClick={() => window.open('https://pcpartpicker.com', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fa003f'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>PC Parts Store</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Shop the latest hardware</div>
                    </div>
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }} 
                      onClick={() => window.open('https://www.tomshardware.com', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fa003f'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Tech News Hub</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Tom's Hardware - Latest tech news</div>
                    </div>
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }} 
                      onClick={() => window.open('https://www.twitch.tv', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9146ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Twitch</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Live game streaming</div>
                    </div>
                    <div style={{ background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }} 
                      onClick={() => window.open('https://www.reddit.com/r/buildapc', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fa003f'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Reddit r/buildapc</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Community PC building advice</div>
                    </div>
                  </div>
                </div>

                {/* Search Widget */}
                <div style={{ background: '#111116', border: '1px solid #333', borderRadius: '12px', padding: '20px', width: '300px', borderTop: '3px solid #00f0ff' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#00f0ff' }}>🔍</span> Quick Search
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#18181f', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'all 0.2s' }} 
                      onClick={() => navigateTo('https://www.google.com/search?igu=1')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f0ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '24px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>G</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Google Search</div>
                    </div>
                    
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#18181f', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'all 0.2s' }} 
                      onClick={() => window.open('https://www.youtube.com', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff0000'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '24px', color: '#ff0000', width: '30px', textAlign: 'center' }}>▶</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>YouTube</div>
                    </div>

                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#18181f', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'all 0.2s' }} 
                      onClick={() => window.open('https://music.youtube.com', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff0000'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '24px', color: '#ff0000', width: '30px', textAlign: 'center' }}>🎵</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>YouTube Music</div>
                    </div>

                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#18181f', padding: '15px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'all 0.2s' }} 
                      onClick={() => window.open('https://www.onlinegdb.com', '_blank')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4a90e2'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '24px', color: '#4a90e2', width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{'</>'}</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>CODE</div>
                    </div>
                  </div>
                </div>

                {/* Free Games Widget */}
                <div style={{ background: '#111116', border: '1px solid #333', borderRadius: '12px', padding: '20px', width: '300px', borderTop: '3px solid #a200ff' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#a200ff' }}>🎁</span> Free Games
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/city-car-driving-simulator')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>Vice City</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/bloxdhop-io')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>Minecraft</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/angry-gran-run')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>Angry Birds</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/madalin-stunt-cars-2')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>CAR</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/moto-x3m')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>HILL CLIMB</div>
                      <div style={{ fontSize: '11px', background: '#a200ff', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>FREE</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#18181f', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s' }}
                      onClick={() => navigateTo('https://www.crazygames.com/embed/geometry-dash-online')}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a200ff'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
                    >
                      <div style={{ fontSize: '13px', color: '#ccc' }}>DASH</div>
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
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            allow="pointer-lock; fullscreen; autoplay; keyboard-map"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: '#fff' }}
          />
        )}
      </div>
    </div>
  );
}
