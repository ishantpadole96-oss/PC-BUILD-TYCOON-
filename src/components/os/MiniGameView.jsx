import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VirtualOS.css';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;

function FlappyBird({ onBack }) {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [birdPos, setBirdPos] = useState(250);
  const [pipes, setPipes] = useState([]);
  
  const birdVelocity = useRef(0);
  const birdY = useRef(250);
  const pipesRef = useRef([]);
  const scoreRef = useRef(0);
  
  const GRAVITY = 0.5;
  const JUMP = -8;
  const PIPE_SPEED = 4;
  const PIPE_WIDTH = 50;
  const HOLE_SIZE = 140;
  const BIRD_SIZE = 30;

  const jump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('playing');
      birdVelocity.current = JUMP;
    } else if (gameState === 'playing') {
      birdVelocity.current = JUMP;
    } else if (gameState === 'gameover') {
      // reset
      setGameState('start');
      setScore(0);
      setBirdPos(250);
      setPipes([]);
      birdVelocity.current = 0;
      birdY.current = 250;
      pipesRef.current = [];
      scoreRef.current = 0;
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let frameId;
    let frameCount = 0;

    const loop = () => {
      frameCount++;
      
      // Update bird
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;
      
      // Update pipes
      if (frameCount % 75 === 0) {
        const topHeight = Math.random() * (GAME_HEIGHT - HOLE_SIZE - 100) + 50;
        pipesRef.current.push({
          x: GAME_WIDTH,
          topHeight,
          passed: false
        });
      }

      pipesRef.current.forEach(p => {
        p.x -= PIPE_SPEED;
        
        // Check scoring
        if (!p.passed && p.x + PIPE_WIDTH < 100) {
          p.passed = true;
          scoreRef.current += 1;
        }
      });

      // Filter out off-screen pipes
      pipesRef.current = pipesRef.current.filter(p => p.x + PIPE_WIDTH > 0);

      // Collision detection
      const birdHitbox = {
        left: 100,
        right: 100 + BIRD_SIZE,
        top: birdY.current,
        bottom: birdY.current + BIRD_SIZE
      };

      if (birdY.current < 0 || birdY.current + BIRD_SIZE > GAME_HEIGHT) {
        setGameState('gameover');
        return;
      }

      let hit = false;
      for (const p of pipesRef.current) {
        if (birdHitbox.right > p.x && birdHitbox.left < p.x + PIPE_WIDTH) {
          if (birdHitbox.top < p.topHeight || birdHitbox.bottom > p.topHeight + HOLE_SIZE) {
            hit = true;
            break;
          }
        }
      }

      if (hit) {
        setGameState('gameover');
        return;
      }

      // Sync state
      setBirdPos(birdY.current);
      setPipes([...pipesRef.current]);
      setScore(scoreRef.current);

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0 }}>Score: {score}</h2>
      </div>
      
      <div 
        onClick={jump}
        style={{ 
          position: 'relative', width: GAME_WIDTH, height: GAME_HEIGHT, 
          background: '#87CEEB', overflow: 'hidden', border: '4px solid #334155', borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {/* Bird */}
        <div style={{
          position: 'absolute', top: birdPos, left: 100, width: BIRD_SIZE, height: BIRD_SIZE,
          background: '#FFD700', borderRadius: '50%', border: '2px solid #000'
        }}></div>

        {/* Pipes */}
        {pipes.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{
              position: 'absolute', top: 0, left: p.x, width: PIPE_WIDTH, height: p.topHeight,
              background: '#2ecc71', border: '2px solid #27ae60'
            }}></div>
            <div style={{
              position: 'absolute', top: p.topHeight + HOLE_SIZE, left: p.x, width: PIPE_WIDTH, height: GAME_HEIGHT - (p.topHeight + HOLE_SIZE),
              background: '#2ecc71', border: '2px solid #27ae60'
            }}></div>
          </React.Fragment>
        ))}

        {gameState === 'start' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            Click or Space to Start
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: 'white' }}>
            <h2 style={{ fontSize: '32px', margin: 0, color: '#ef4444' }}>GAME OVER</h2>
            <p>Score: {score}</p>
            <p>Click or Space to Restart</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SnakeGame({ onBack }) {
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 15, y: 15});
  
  const direction = useRef({x: 1, y: 0});
  const snakeRef = useRef([{x: 10, y: 10}]);
  const scoreRef = useRef(0);
  
  const GRID_SIZE = 20;
  const CELL_SIZE = GAME_WIDTH / GRID_SIZE; // 20px

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setSnake([{x: 10, y: 10}]);
    snakeRef.current = [{x: 10, y: 10}];
    direction.current = {x: 1, y: 0};
    setFood({x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * (GAME_HEIGHT / CELL_SIZE))});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'start' || gameState === 'gameover') {
        if (e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }
      switch (e.code) {
        case 'ArrowUp':
          if (direction.current.y === 0) { e.preventDefault(); direction.current = {x: 0, y: -1}; }
          break;
        case 'ArrowDown':
          if (direction.current.y === 0) { e.preventDefault(); direction.current = {x: 0, y: 1}; }
          break;
        case 'ArrowLeft':
          if (direction.current.x === 0) { e.preventDefault(); direction.current = {x: -1, y: 0}; }
          break;
        case 'ArrowRight':
          if (direction.current.x === 0) { e.preventDefault(); direction.current = {x: 1, y: 0}; }
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = setInterval(() => {
      const head = { ...snakeRef.current[0] };
      head.x += direction.current.x;
      head.y += direction.current.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= (GAME_HEIGHT / CELL_SIZE)) {
        setGameState('gameover');
        return;
      }

      // Self collision
      if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameover');
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      // Food
      setFood(currentFood => {
        if (head.x === currentFood.x && head.y === currentFood.y) {
          scoreRef.current += 10;
          setScore(scoreRef.current);
          return {x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * (GAME_HEIGHT / CELL_SIZE))};
        } else {
          newSnake.pop();
          return currentFood;
        }
      });

      snakeRef.current = newSnake;
      setSnake(newSnake);

    }, 100);

    return () => clearInterval(loop);
  }, [gameState]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0 }}>Score: {score}</h2>
      </div>
      
      <div 
        style={{ 
          position: 'relative', width: GAME_WIDTH, height: GAME_HEIGHT, 
          background: '#0f172a', border: '4px solid #334155', borderRadius: '8px'
        }}
      >
        {snake.map((segment, i) => (
          <div key={i} style={{
            position: 'absolute', top: segment.y * CELL_SIZE, left: segment.x * CELL_SIZE,
            width: CELL_SIZE, height: CELL_SIZE, background: '#22c55e', border: '1px solid #166534', borderRadius: i===0?'4px':'0'
          }}></div>
        ))}
        
        <div style={{
          position: 'absolute', top: food.y * CELL_SIZE, left: food.x * CELL_SIZE,
          width: CELL_SIZE, height: CELL_SIZE, background: '#ef4444', borderRadius: '50%'
        }}></div>

        {gameState === 'start' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            Press Space to Start
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: 'white' }}>
            <h2 style={{ fontSize: '32px', margin: 0, color: '#ef4444' }}>GAME OVER</h2>
            <p>Score: {score}</p>
            <p>Press Space to Restart</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MiniGameView() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div className="mini-game-view" style={{ width: '100%', height: '100%', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {!activeGame && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#38bdf8', marginBottom: '40px', fontSize: '3rem', textAlign: 'center' }}>TitanOS<br/>Arcade Hub</h1>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div 
              onClick={() => setActiveGame('flappy')}
              style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', border: '2px solid #334155', width: '200px', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🐦</div>
              <h3 style={{ margin: 0 }}>Flappy Bird</h3>
            </div>
            
            <div 
              onClick={() => setActiveGame('snake')}
              style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', border: '2px solid #334155', width: '200px', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🐍</div>
              <h3 style={{ margin: 0 }}>Snake</h3>
            </div>
          </div>
        </div>
      )}
      {activeGame === 'flappy' && <FlappyBird onBack={() => setActiveGame(null)} />}
      {activeGame === 'snake' && <SnakeGame onBack={() => setActiveGame(null)} />}
    </div>
  );
}
