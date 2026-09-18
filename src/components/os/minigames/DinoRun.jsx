import React, { useState, useEffect, useRef, useCallback } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 300;

export function DinoRun({ onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [dinoY, setDinoY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  
  const dinoYRef = useRef(0);
  const velocityYRef = useRef(0);
  const isJumping = useRef(false);
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);
  const requestRef = useRef();

  const GRAVITY = 0.6;
  const JUMP_POWER = -10;
  const GROUND_Y = 250;
  const DINO_SIZE = 30;

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setObstacles([]);
    scoreRef.current = 0;
    obstaclesRef.current = [];
    dinoYRef.current = GROUND_Y - DINO_SIZE;
    velocityYRef.current = 0;
    setDinoY(dinoYRef.current);
  };

  const jump = useCallback(() => {
    if (!isPlaying) {
      startGame();
      return;
    }
    if (!isJumping.current) {
      velocityYRef.current = JUMP_POWER;
      isJumping.current = true;
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (!isPlaying) return;

    let frames = 0;
    const loop = () => {
      frames++;
      scoreRef.current++;
      
      // Physics
      velocityYRef.current += GRAVITY;
      dinoYRef.current += velocityYRef.current;
      
      if (dinoYRef.current > GROUND_Y - DINO_SIZE) {
        dinoYRef.current = GROUND_Y - DINO_SIZE;
        velocityYRef.current = 0;
        isJumping.current = false;
      }

      // Spawning
      if (frames % 80 === 0) {
        obstaclesRef.current.push({
          x: GAME_WIDTH,
          width: 20 + Math.random() * 20,
          height: 30 + Math.random() * 20
        });
      }

      // Move & collide
      let hit = false;
      obstaclesRef.current.forEach(obs => {
        obs.x -= 5 + (scoreRef.current * 0.001); // speed up
        
        // AABB collision
        if (
          50 < obs.x + obs.width &&
          50 + DINO_SIZE > obs.x &&
          dinoYRef.current < GROUND_Y &&
          dinoYRef.current + DINO_SIZE > GROUND_Y - obs.height
        ) {
          hit = true;
        }
      });

      obstaclesRef.current = obstaclesRef.current.filter(o => o.x + o.width > 0);

      if (hit) {
        setIsPlaying(false);
      } else {
        setDinoY(dinoYRef.current);
        setObstacles([...obstaclesRef.current]);
        if (frames % 10 === 0) setScore(Math.floor(scoreRef.current / 10));
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
      
      <div onClick={jump} style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#f8fafc', position: 'relative', overflow: 'hidden', borderRadius: '8px', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', top: GROUND_Y, left: 0, width: '100%', height: '2px', background: '#94a3b8' }}></div>
        
        {/* Dino */}
        <div style={{ position: 'absolute', left: 50, top: dinoY, width: DINO_SIZE, height: DINO_SIZE, background: '#475569', borderRadius: '4px' }}></div>
        
        {/* Obstacles */}
        {obstacles.map((obs, i) => (
          <div key={i} style={{ 
            position: 'absolute', left: obs.x, top: GROUND_Y - obs.height, 
            width: obs.width, height: obs.height, background: '#ef4444', borderRadius: '4px 4px 0 0' 
          }}></div>
        ))}

        {!isPlaying && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
            <h2 style={{ color: 'white' }}>Dino Run</h2>
            <p>Press Space or Click to jump</p>
            {score > 0 && <h3>Game Over! Score: {score}</h3>}
          </div>
        )}
      </div>
    </div>
  );
}
