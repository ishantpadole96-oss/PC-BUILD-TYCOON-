import React, { useState, useEffect } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

export function WhackAMole({ onBack }) {
  const [score, setScore] = useState(0);
  const [activeHole, setActiveHole] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isPlaying || timeLeft === 0) return;
    
    const moleTimer = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * 9));
    }, 800);
    
    const countdown = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => {
      clearInterval(moleTimer);
      clearInterval(countdown);
    };
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsPlaying(false);
      setActiveHole(null);
    }
  }, [timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const whack = (i) => {
    if (i === activeHole) {
      setScore(s => s + 1);
      setActiveHole(null);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Score: {score} | Time: {timeLeft}s</h2>
      </div>
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#1e293b', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px', borderRadius: '8px', position: 'relative' }}>
        {Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
            {activeHole === i && (
              <div onClick={() => whack(i)} style={{ fontSize: '64px', cursor: 'pointer', transform: 'translateY(10px)' }}>🦠</div>
            )}
          </div>
        ))}
        {!isPlaying && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <h3 style={{ color: 'white' }}>{timeLeft === 0 ? 'Time Up!' : 'Virus Whacker'}</h3>
            <button onClick={startGame} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {timeLeft === 0 ? 'Play Again' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
