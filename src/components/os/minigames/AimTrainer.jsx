import React, { useState, useEffect, useRef } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

export function AimTrainer({ onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [target, setTarget] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const spawnTarget = () => {
    setTarget({
      x: Math.random() * (GAME_WIDTH - 30),
      y: Math.random() * (GAME_HEIGHT - 30)
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    spawnTarget();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          setTarget(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleClick = () => {
    if (!isPlaying) return;
    setScore(s => s + 1);
    spawnTarget();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Score: {score} | Time: {timeLeft}s</h2>
      </div>
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#1e293b', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
        {target && (
          <div
            onClick={handleClick}
            style={{
              position: 'absolute', left: target.x, top: target.y, width: '30px', height: '30px',
              background: '#ef4444', borderRadius: '50%', cursor: 'crosshair',
              boxShadow: '0 0 10px #ef4444'
            }}
          ></div>
        )}
        {!isPlaying && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: 'white' }}>
            <h2>Aim Trainer</h2>
            <p>Click the red dots as fast as you can.</p>
            {score > 0 && <p>Final Score: {score}</p>}
            <button onClick={startGame} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Start Game</button>
          </div>
        )}
      </div>
    </div>
  );
}
