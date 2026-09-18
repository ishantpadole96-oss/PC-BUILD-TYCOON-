import React, { useState, useEffect } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

export function ClickerGame({ onBack }) {
  const [score, setScore] = useState(0);
  const [clickValue, setClickValue] = useState(1);
  const [autoClicks, setAutoClicks] = useState(0);

  useEffect(() => {
    if (autoClicks === 0) return;
    const loop = setInterval(() => {
      setScore(s => s + autoClicks);
    }, 1000);
    return () => clearInterval(loop);
  }, [autoClicks]);

  const handleClick = (e) => {
    setScore(s => s + clickValue);
    
    // Simple pop animation
    const el = e.currentTarget;
    el.style.transform = 'scale(0.95)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 100);
  };

  const buyUpgrade = (cost, type) => {
    if (score >= cost) {
      setScore(s => s - cost);
      if (type === 'click') setClickValue(v => v + 1);
      if (type === 'auto') setAutoClicks(v => v + 1);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Bits: {score}</h2>
      </div>
      
      <div style={{ width: GAME_WIDTH, background: '#1e293b', borderRadius: '8px', padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
          {clickValue} bits per click | {autoClicks} bits per second
        </div>

        <div 
          onClick={handleClick}
          style={{ fontSize: '100px', cursor: 'pointer', transition: 'transform 0.1s', userSelect: 'none' }}
        >
          🖥️
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => buyUpgrade(10 * clickValue * clickValue, 'click')}
            disabled={score < 10 * clickValue * clickValue}
            style={{ padding: '10px', background: score >= 10 * clickValue * clickValue ? '#3b82f6' : '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: score >= 10 * clickValue * clickValue ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between' }}
          >
            <span>Upgrade Mouse (+1/click)</span>
            <span>Cost: {10 * clickValue * clickValue}</span>
          </button>
          
          <button 
            onClick={() => buyUpgrade(50 * (autoClicks + 1), 'auto')}
            disabled={score < 50 * (autoClicks + 1)}
            style={{ padding: '10px', background: score >= 50 * (autoClicks + 1) ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: score >= 50 * (autoClicks + 1) ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between' }}
          >
            <span>Auto Miner (+1/sec)</span>
            <span>Cost: {50 * (autoClicks + 1)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
