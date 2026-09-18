import React, { useState, useEffect } from 'react';

const GAME_WIDTH = 400;

export function SimonSays({ onBack }) {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayerSeq([]);
    setIsPlaying(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (isPlaying && playerSeq.length === 0) {
      playSequence();
    }
  }, [sequence, isPlaying]);

  const playSequence = async () => {
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setActiveColor(sequence[i]);
      await new Promise(r => setTimeout(r, 500));
      setActiveColor(null);
    }
  };

  const handleColorClick = (colorIndex) => {
    if (!isPlaying || activeColor !== null) return;
    
    const newPlayerSeq = [...playerSeq, colorIndex];
    setPlayerSeq(newPlayerSeq);
    setActiveColor(colorIndex);
    setTimeout(() => setActiveColor(null), 200);

    if (sequence[newPlayerSeq.length - 1] !== colorIndex) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setTimeout(() => {
        setSequence([...sequence, Math.floor(Math.random() * 4)]);
        setPlayerSeq([]);
      }, 1000);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Score: {sequence.length > 0 ? sequence.length - 1 : 0}</h2>
      </div>
      <div style={{ width: GAME_WIDTH, height: GAME_WIDTH, background: '#1e293b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '20px', borderRadius: '50%', position: 'relative' }}>
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => handleColorClick(i)}
            style={{
              background: color,
              borderRadius: i===0?'100% 0 0 0':i===1?'0 100% 0 0':i===2?'0 0 0 100%':'0 0 100% 0',
              opacity: activeColor === i ? 1 : 0.6,
              cursor: isPlaying ? 'pointer' : 'default',
              transition: 'opacity 0.1s'
            }}
          ></div>
        ))}
        {(!isPlaying || gameOver) && (
          <div style={{ position: 'absolute', inset: '25%', background: '#0f172a', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{gameOver ? 'Game Over!' : 'Simon Says'}</h3>
            <button onClick={startGame} style={{ padding: '8px 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {gameOver ? 'Try Again' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
