import React, { useState, useRef } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 400;

export function ReactionTest({ onBack }) {
  const [state, setState] = useState('start'); // start, waiting, click, result
  const [reactionTime, setReactionTime] = useState(null);
  const startTime = useRef(0);
  const timeoutRef = useRef(null);

  const handleStart = () => {
    setState('waiting');
    setReactionTime(null);
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    timeoutRef.current = setTimeout(() => {
      setState('click');
      startTime.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      clearTimeout(timeoutRef.current);
      setState('start');
      alert("Too early! Wait for green.");
    } else if (state === 'click') {
      const time = Date.now() - startTime.current;
      setReactionTime(time);
      setState('result');
    } else {
      handleStart();
    }
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'waiting': return '#ef4444';
      case 'click': return '#22c55e';
      case 'result': return '#3b82f6';
      default: return '#1e293b';
    }
  };

  const getMessage = () => {
    switch (state) {
      case 'waiting': return 'Wait for green...';
      case 'click': return 'CLICK!';
      case 'result': return `${reactionTime} ms\nClick to try again`;
      default: return 'Reaction Time Test\nClick to start';
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: GAME_WIDTH, marginBottom: '10px' }}>
        <button onClick={onBack} style={{ background: '#334155', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>◀ Back</button>
        <h2 style={{ margin: 0, color: 'white' }}>Reaction</h2>
      </div>
      
      <div 
        onClick={handleClick}
        style={{ 
          width: GAME_WIDTH, height: GAME_HEIGHT, 
          background: getBackgroundColor(), borderRadius: '8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.1s',
          whiteSpace: 'pre-line', textAlign: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold'
        }}
      >
        {getMessage()}
      </div>
    </div>
  );
}
