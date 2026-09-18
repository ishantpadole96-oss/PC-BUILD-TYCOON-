import React, { useState, useEffect, useRef } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PLAYER_W = 60;
const PLAYER_H = 20;
const ITEM_SIZE = 20;

export function CatchGame({ onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_W / 2);
  const [items, setItems] = useState([]);
  
  const playerXRef = useRef(GAME_WIDTH / 2 - PLAYER_W / 2);
  const itemsRef = useRef([]);
  const scoreRef = useRef(0);
  const requestRef = useRef();

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setItems([]);
    scoreRef.current = 0;
    itemsRef.current = [];
    playerXRef.current = GAME_WIDTH / 2 - PLAYER_W / 2;
    setPlayerX(playerXRef.current);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') {
        playerXRef.current = Math.max(0, playerXRef.current - 30);
        setPlayerX(playerXRef.current);
      }
      if (e.code === 'ArrowRight') {
        playerXRef.current = Math.min(GAME_WIDTH - PLAYER_W, playerXRef.current + 30);
        setPlayerX(playerXRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let frames = 0;
    const loop = () => {
      frames++;
      
      // Spawn item
      if (frames % 40 === 0) {
        itemsRef.current.push({
          x: Math.random() * (GAME_WIDTH - ITEM_SIZE),
          y: -ITEM_SIZE,
          type: Math.random() > 0.2 ? 'cpu' : 'bomb'
        });
      }

      // Move items
      itemsRef.current.forEach(item => {
        item.y += 4;
      });

      // Collision
      const pX = playerXRef.current;
      const pY = GAME_HEIGHT - 30; // player Y

      itemsRef.current = itemsRef.current.filter(item => {
        // Hit player
        if (item.y + ITEM_SIZE > pY && item.y < pY + PLAYER_H && item.x + ITEM_SIZE > pX && item.x < pX + PLAYER_W) {
          if (item.type === 'cpu') {
            scoreRef.current += 10;
          } else {
            setIsPlaying(false);
          }
          return false;
        }
        // Missed bottom
        if (item.y > GAME_HEIGHT) {
          if (item.type === 'cpu') {
            setIsPlaying(false); // lose if miss cpu
          }
          return false;
        }
        return true;
      });

      if (isPlaying) {
        setItems([...itemsRef.current]);
        setScore(scoreRef.current);
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Score: {score}</h2>
      </div>
      
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#1e293b', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
        <div style={{ position: 'absolute', bottom: 30, left: playerX, width: PLAYER_W, height: PLAYER_H, background: '#3b82f6', borderRadius: '4px' }}></div>
        
        {items.map((item, i) => (
          <div key={i} style={{ 
            position: 'absolute', left: item.x, top: item.y, fontSize: '20px', 
            width: ITEM_SIZE, height: ITEM_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            {item.type === 'cpu' ? '💾' : '💣'}
          </div>
        ))}

        {!isPlaying && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: 'white' }}>
            <h2>Catch the Hardware</h2>
            <p>Use Left/Right arrows. Avoid bombs!</p>
            {score > 0 && <p>Score: {score}</p>}
            <button onClick={startGame} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Play</button>
          </div>
        )}
      </div>
    </div>
  );
}
